import {Express, Request, Response} from "express";
import {CategoryDocument, CategoryModel} from "../models/Category";
import {CustomError} from "../utils/CustomError";
import {CategoryType, VariantType} from "../models/enums/enum";
import {AuthenticatedRequest, sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import CloudinaryService from "../services/CloudinaryService";
import {UploadApiResponse} from "cloudinary";
import {ImageResponse, ProductDocument, ProductModel, ProductVariant} from "../models/Product";
import {validateMongooseId} from "../utils/helpers";
import {WishlistDocument, WishlistModel} from "../models/WishlistSchema";
import {CartDocument, CartItem, CartModel} from "../models/Cart";
import {UserDocument} from "../models/User";

const createProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const productImages: Express.Multer.File[] | undefined = req.files as Express.Multer.File[];
        const {name, description, brandId, categoryId, variants} = req.body;

        const variantsJson = JSON.parse(variants);

        if (!productImages || !productImages.length) {
            throw new CustomError("Upload the product image(s).", CustomError.BAD_REQUEST);
        }
        productImages.forEach(image => {
            if (!image || !image.mimetype.startsWith("image/")) {
                throw new CustomError("All image(s) must be a .png, .jpg or .jpeg files.", CustomError.BAD_REQUEST);
            }
        });
        const category: CategoryDocument | null = await CategoryModel.findOne({
            _id: categoryId,
            type: CategoryType.PRODUCT
        });
        if (!category) {
            throw new CustomError("Product category does not exist.");
        }

        const brand: CategoryDocument | null = await CategoryModel.findOne({_id: brandId, type: CategoryType.BRAND});
        if (!brand) {
            throw new CustomError("Brand does not exist.");
        }

        let type: VariantType;
        if (variantsJson[0].color) {
            type = VariantType.COLOR
        } else if (variantsJson[0].size) {
            type = VariantType.SIZE
        } else {
            throw new CustomError("You may select only size or color, neither both nor none.", CustomError.BAD_REQUEST);
        }

        const product: ProductDocument = new ProductModel({
            name: name,
            description: description,
            brand: brand.id,
            category: category.id,
            variants: variantsJson,
            variantType: type
        });

        let counter: number = 0;
        for (const image of productImages) {
            const res: UploadApiResponse = await CloudinaryService.uploadMedia(image.path, {
                public_id: `koomia/products/${product.id}/images/${counter}`,
                resource_type: 'image'
            });
            product.images.push({url: res.secure_url, publicId: res.public_id} as ImageResponse);
            counter += 1;
        }

        await product.save()

        return sendSuccessResponse(res, product, `Product created.`, 201);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const getProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const page: number = req.query.page ? Number(req.query.page) : 1;
        const limit: number = req.query.limit ? Number(req.query.limit) : 10;

        const products: ProductDocument[] = await ProductModel
            .find()
            .limit(limit)
            .skip((page - 1) * limit);

        const basicProducts = products.map(product => product.getBasicInfo());

        const response = {
            currentPage: page,
            products: basicProducts,
            total: await ProductModel.countDocuments(),
            totalPages: Math.ceil(await ProductModel.countDocuments() / limit)
        }

        return sendSuccessResponse(res, response, "Products fetched.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const getProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {productId} = req.params;
        validateMongooseId(productId, "product");
        const product: ProductDocument | null = await ProductModel.findById(productId);
        if (!product) {
            throw new CustomError("Product does not exist.");
        }

        return sendSuccessResponse(res, product, "Product fetched.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const updateProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {productId} = req.params;
        const {name, description} = req.body;

        const product: ProductDocument | null = await ProductModel.findById(productId);
        if (!product) {
            throw new CustomError("Product does not exist.");
        }

        await product.set({
            name: name ? name : product.name,
            description: description ? description : product.description
        }).save();

        return sendSuccessResponse(res, product, "Product updated.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const addProductVariant = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {productId} = req.params;
        const {color, size, stockQuantity, price} = req.body;

        const product: ProductDocument | null = await ProductModel.findById(productId);
        if (!product) {
            throw new CustomError("Product does not exist.");
        }

        if (product.variantType === VariantType.COLOR) {
            if (!color) {
                throw new CustomError("Color field is required for this product.", CustomError.BAD_REQUEST);
            }

            product.variants.push({
                color: color,
                stockQuantity: stockQuantity,
                price: price
            } as ProductVariant);
        } else if (product.variantType === VariantType.SIZE) {
            if (!size) {
                throw new CustomError("Size field is required for this product.", CustomError.BAD_REQUEST);
            }
            product.variants.push({
                size: size,
                stockQuantity: stockQuantity,
                price: price
            } as ProductVariant);
        } else {
            product.variants.push({
                stockQuantity: stockQuantity,
                price: price
            } as ProductVariant);
        }

        await product.save()

        return sendSuccessResponse(res, product, "Variant deleted.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const deleteProductVariant = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {productId, variantId} = req.params;

        const product: ProductDocument | null = await ProductModel.findById(productId);
        if (!product) {
            throw new CustomError("Product does not exist.");
        }

        await product.updateOne({
            $pull: {
                variants: {_id: variantId}
            }
        });

        return sendSuccessResponse(res, null, "Variant deleted.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {productId} = req.params;

        const product: ProductDocument | null = await ProductModel.findByIdAndDelete(productId);
        if (!product) {
            throw new CustomError("Product does not exist.");
        }

        return sendSuccessResponse(res, productId, "Product deleted.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const addToWishlist = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const {productId} = req.params;
        const product: ProductDocument | null = await ProductModel.findById(productId);
        if (!product) {
            throw new CustomError("Product does not exist.");
        }

        const wishlist: WishlistDocument = await WishlistModel.findById(req.user!!.id) as WishlistDocument;

        await wishlist.updateOne({
            $push: {products: product.id}
        })

        return sendSuccessResponse(res, null, "Added to wishlists.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const removeFromWishlist = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const {productId} = req.params;
        const product: ProductDocument | null = await ProductModel.findById(productId);
        if (!product) {
            throw new CustomError("Product does not exist.");
        }

        const wishlist: WishlistDocument = await WishlistModel.findById(req.user!!.id) as WishlistDocument;

        await wishlist.updateOne({
            $pull: {products: product.id}
        })

        return sendSuccessResponse(res, null, "Removed from wishlists.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const upsertToCart = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const {productId, variantId} = req.params;
        const {quantity} = req.body;

        const user: UserDocument = req.user as UserDocument;

        const product: ProductDocument | null = await ProductModel.findById(productId);
        if (!product) {
            throw new CustomError("Product does not exist.");
        }

        const variant: ProductVariant | undefined = product.variants.find(variant => variant._id.equals(variantId));
        if (!variant) {
            throw new CustomError("Variant does not exist for this product.");
        }

        const cart: CartDocument = await CartModel.findOne({user: user.id}) as CartDocument;
        const cartVariant = cart.items.find(item => item.variant.equals(variant.id));
        if (cartVariant) {
            cartVariant.quantity = quantity;
            await cart.save()
        } else {
            cart.items.push({
                product: product.id,
                variant: variant.id,
                quantity: quantity
            } as CartItem)
            await cart.save()
        }

        return sendSuccessResponse(res, cart, "Product added to cart.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const removeFromCart = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const {productId, variantId} = req.params;

        const userCart: CartDocument | null = await CartModel.findOneAndUpdate({user: req.user!!.id}, {
            $pull: {
                items: {product: productId, variant: variantId}
            }
        }, {new: true});

        return sendSuccessResponse(res, userCart, "Product removed from cart.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

export {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    addProductVariant,
    deleteProductVariant,
    deleteProduct,
    addToWishlist,
    removeFromWishlist,
    upsertToCart,
    removeFromCart
//     getAllReviews,
//     addReview,
//     addOrRemoveFromCart
}