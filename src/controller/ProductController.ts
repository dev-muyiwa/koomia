import {Express, Request, Response} from "express";
import {CategoryDocument, CategoryModel} from "../models/Category";
import {CustomError} from "../utils/CustomError";
import {CategoryType} from "../models/enums/enum";
import {sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import CloudinaryService from "../services/CloudinaryService";
import {UploadApiResponse} from "cloudinary";
import {ImageResponse, ProductDocument, ProductModel} from "../models/Product";
import {validateMongooseId} from "../utils/helpers";

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

        const product: ProductDocument = new ProductModel({
            name: name,
            description: description,
            brand: brand.id,
            category: category.id,
            variants: variantsJson,
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

export {
    createProduct,
    getProducts,
    getProduct
//     getSingleProduct,
//     getAllProducts,
//     updateProduct,
//     deleteProduct,
//     addOrDeleteFromWishlist,
//     getAllReviews,
//     addReview,
//     addOrRemoveFromCart
}