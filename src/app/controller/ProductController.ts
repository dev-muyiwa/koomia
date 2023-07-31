import {Request, Response} from "express";
import Product from "../models/ProductSchema";
import {CustomError, errorHandler, responseHandler} from "../../utils/responseResult";
import {validateDbId} from "../../utils/dbValidation";
import slugify from "slugify";
import {AuthenticatedRequest} from "../middlewares/auth";
import {Schema, Types} from "mongoose";
import {ImageResponse, uploadImages} from "../../services/fileUploadService";
import Wishlist from "../models/WishlistSchema";
import Review, {Rating} from "../models/ReviewSchema";
import Cart from "../models/CartSchema";
import * as Mongoose from "mongoose";


const createProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        req.body.slug = slugify(req.body.name);
        if (!req.files || req.files.length == 0) {
            throw new CustomError("No image(s) found.", CustomError.NOT_FOUND);
        }

        const imagePath: string[] = (req.files as Express.Multer.File[]).map(file => file.path);
        const product: Product = await Product.create(req.body);
        const files: ImageResponse[] = await uploadImages(imagePath, product.slug);
        product.images.push(...files);
        await product.save();

        // console.log("ID is", product)
        const review = await Review.create({product: product._id});
        // console.log("Review is", review)
        await review.save();

        return responseHandler(res, product, `${product.name} created.`, 201);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getSingleProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const productId: string = req.params.id;
        validateDbId(productId);
        const product: Product | null = await Product.findById(productId);
        if (!product) {
            throw new CustomError(`Product not found.`, CustomError.NOT_FOUND);
        }

        return responseHandler(res, product, `${product.name} gotten.`);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getAllProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const query: { [key: string]: any } = {...req.query};
        const excludeFields: string[] = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((element: string) => delete query[element]);

        let queryStr: string = JSON.stringify(query);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match: string) => `$${match}`)

        let productQuery = Product.find(JSON.parse(queryStr));

        //Sorting.
        const sortBy: string = (req.query.sort) ?
            (req.query.sort as string).split(",").join(" ") : "-createdAt";
        productQuery = productQuery.sort(sortBy);

        // Limiting.
        const fields: string = (req.query.fields) ?
            (req.query.fields as string).split(",").join(" ") : "-__v";
        productQuery = productQuery.select(fields);

        // Pagination.
        const page: string = (req.query.page as string);
        const limit: number = Number((req.query.limit as string));
        const skip: number = (Number(page) - 1) * Number(limit);
        productQuery = productQuery.skip(skip).limit(limit)

        if (req.query.page) {
            const productCount: number = await Product.countDocuments();
            if (skip >= productCount) throw new CustomError("Page not found.", CustomError.NOT_FOUND)
        }

        return responseHandler(res, await productQuery, "Product(s) gotten.");
    } catch (err) {
        return errorHandler(res, err);
    }
}

const updateProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const productId: string = req.params.id;
        validateDbId(productId);
        if (req.body.name) {
            req.body.slug = slugify(req.body.name);
        }
        const product: Product | null = await Product.findByIdAndUpdate(productId, req.body, {new: true});
        if (!product) {
            throw new CustomError(`Product ${req.params.id} not found.`, CustomError.NOT_FOUND);
        }
        await product.save();

        return responseHandler(res, product, `${product.name} updated.`);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const productId: string = req.params.id;
        validateDbId(productId);

        const product: Product | null = await Product.findByIdAndDelete(productId);
        if (!product) {
            throw new CustomError(`Product not found.`, CustomError.NOT_FOUND);
        }

        return responseHandler(res, null, `${product.name} deleted.`);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const addOrDeleteFromWishlist = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId: string = req.user?.id;
        const productId: string = req.params.id;
        validateDbId(productId);
        const product: Product | null = await Product.findById(productId);
        if (!product) {
            throw new CustomError(`Product not found.`, CustomError.NOT_FOUND);
        }
        let wishlist: Wishlist  = await Wishlist.findOne({user: userId}) as Wishlist;

        const isInWishlist: boolean = wishlist.products.find(
            (id: Types.ObjectId): boolean => id.toString() === productId.toString()
        ) != undefined

        let message: string;
        if (isInWishlist) {
            await wishlist.updateOne({$pull: {products: productId}});
            message = `${product.name} removed from wishlist.`;
        } else {
            await wishlist.updateOne({$push: {products: productId}});
            message = `${product.name} added to wishlist.`;
        }
        await wishlist.save();

        return responseHandler(res, null, message);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getAllReviews = async (req: Request, res: Response): Promise<Response> => {
    try {
        const productId: string = req.params.id;
        validateDbId(productId);
        const reviews: Review | null = await Review.findOne({product: productId})
            .select(["ratings", "average_stars", "-_id"]);
        if (!reviews) {
            throw new CustomError(`Reviews not found.`, CustomError.NOT_FOUND);
        }

        return responseHandler(res, reviews, `Reviews gotten.`);
    } catch (err) {
        return errorHandler(res, err);
    }
}
const addReview = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId: string = req.user?.id;
        const productId: string = req.params.id;
        const {star, comment} = req.body;
        validateDbId(productId);
        const product: Product|null = await Product.findById(productId)
        if (!product) {
            throw new CustomError("Product not found.", CustomError.NOT_FOUND);
        }
        const productReview: Review = await Review.findOne({product: productId}) as Review;
        console.log("Product Review", productReview);
        let alreadyReviewed: Rating | undefined = await productReview.ratings
            .find((rating?: Rating): boolean | undefined => rating?.posted_by?.equals(userId));

        if (alreadyReviewed) {
            alreadyReviewed.stars = star;
            alreadyReviewed.comment = comment;
            await productReview.save();
        } else {
            productReview.ratings.push({
                stars: star,
                comment: comment,
                posted_by: new Mongoose.Types.ObjectId(userId)
            });
            await productReview.save();
        }
        await productReview.save();

        return responseHandler(res, null, `Product reviewed.`, 201);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const addOrRemoveFromCart = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const amount: number = Number(req.query.amount);
        const userId: string = req.user?.id;
        const productId: string = req.params.id;
        validateDbId(productId);
        const product: Product|null = await Product.findById(productId);
        if (!product){
            throw new CustomError("Product not found.", CustomError.NOT_FOUND);
        }
        const userCart: Cart = await Cart.findOne({order_by: userId}) as Cart;
        const cartItem = await userCart.products
            .find((item) => item.product.toString() === productId)

        console.log("Cart Item", cartItem)
        if (cartItem) {
            cartItem.quantity = amount
        } else {
            userCart.products.push({
                product: new Mongoose.Types.ObjectId(productId),
                quantity: amount
            })
        }
        await userCart.save();

        return responseHandler(res, null, "Cart updated.")
    } catch (err) {
        return errorHandler(res, err);
    }
}


export const productController = {
    createProduct,
    getSingleProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    addOrDeleteFromWishlist,
    getAllReviews,
    addReview,
    addOrRemoveFromCart
}