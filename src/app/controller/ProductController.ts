import {Request, Response} from "express";
import Product, {Rating} from "../models/ProductSchema";
import {sendError, sendResponse} from "../../utils/responseResult";
import {validateDbId} from "../../utils/dbValidation";
import slugify from "slugify";
import {AuthenticatedRequest} from "../middlewares/auth";
import User from "../models/UserSchema";
import {Types} from "mongoose";
import {ImageResponse, uploadImages} from "../../services/fileUploadService";

// const create = asyncHandler(async (req: Request, res: Response) => {
//
// })

export class ProductController {
    public async createProduct(req: Request, res: Response) {
        try {
            if (req.body.title) {
                req.body.slug = slugify(req.body.title);
            }
            if (!req.files || req.files.length ==0){
                throw new Error("No files found.");
            }
            console.log("Files are ", req.files)

            const imagePath: string[] = (req.files as Express.Multer.File[]).map(file => file.path);
            console.log(imagePath);
            const product: Product = await Product.create(req.body);
            const files: ImageResponse[] = await uploadImages(imagePath, product.id);
            files.forEach(file => {
                product.images.push(file)
            })

            sendResponse(res, product, "Product created.", 201);
        } catch (err) {
            sendError(res, err, err.message)
        }
    }

    public async getSingleProduct(req: Request, res: Response) {
        try {
            validateDbId(req.params.id);
            const product: Product | null = await Product.findById(req.params.id);
            if (!product) {
                throw new Error("Product doesn't exist.");
            }

            sendResponse(res, product, `Product ${req.params.id} gotten.`);
        } catch (err) {
            sendError(res, err, err.message)
        }
    }

    public async getAllProducts(req: Request, res: Response) {
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
                if (skip >= productCount) throw new Error("Page not found.")

            }

            sendResponse(res, await productQuery, "Product gotten.");
        } catch (err) {
            sendError(res, err, err.message)
        }
    }

    public async updateProduct(req: Request, res: Response) {
        try {
            validateDbId(req.params.id);
            if (req.body.title) {
                req.body.slug = slugify(req.body.title);
            }
            const product: Product | null = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true});
            if (!product) {
                throw new Error(`Product with ID ${req.params.id} not found.`);
            }

            sendResponse(res, product, `Product ${req.params.id} updated.`);
        } catch (err) {
            sendError(res, err, err.message)
        }
    }

    public async deleteProduct(req: Request, res: Response) {
        try {
            validateDbId(req.params.id);

            const product: Product | null = await Product.findByIdAndDelete(req.params.id);
            if (!product) {
                throw new Error(`Product with ID ${req.params.id} not found.`);
            }

            sendResponse(res, null, `Product ${req.params.id} deleted.`);
        } catch (err) {
            sendError(res, err, err.message)
        }
    }

    public async addToWishlist(req: AuthenticatedRequest, res: Response) {
        try {
            const id: string = req.user?.id;
            const productId: string = req.params.id;
            validateDbId(productId);
            let user: User = await User.findById(id) as User;
            const alreadyAdded: boolean = user.wishlist.find(
                (id: Types.ObjectId): boolean => id.toString() === productId.toString()
            ) != undefined

            let message: string;
            if (alreadyAdded) {
                await user.updateOne({$pull: {wishlist: productId}});
                message = `Product ${productId} removed from wishlist.`;
            } else {
                await user.updateOne({$push: {wishlist: productId}});
                message = `Product ${productId} added to wishlist.`;
            }
            await user.save();

            return sendResponse(res, null, message);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async getAllReviews(req: Request, res: Response) {
        try {
            const productId: string = req.params.id;
            // console.log(`Product Id = ${productId}`)
            validateDbId(productId);
            const product: Product | null = await Product.findById(productId);
            if (!product) {
                throw new Error(`Product ${productId} not found.`);
            }

            const ratings = product.ratings;

            return sendResponse(res, ratings, `Product ${productId} reviews.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }
    public async addReview(req: AuthenticatedRequest, res: Response) {
        try {
            const userId: string = req.user?.id;
            const productId: string = req.params.id;
            const {star, review} = req.body;
            validateDbId(productId);
            const product: Product | null = await Product.findById(productId);
            if (!product) {
                throw new Error(`Product ${productId} not found.`);
            }
            let alreadyRated: Rating | undefined = await product.ratings.find((rating: Rating): boolean =>
                rating.posted_by?.equals(userId));

            if (alreadyRated) {
                alreadyRated.star = star;
                alreadyRated.review = review;
                await product.save();
            } else {
                product.ratings.push({
                    star: star,
                    review: review,
                    posted_by: new Types.ObjectId(userId)
                });
                await product.save();
            }

            // product.average_rating = product.calculateAverageRating();
            await product.save();

            return sendResponse(res, null, `Product ${productId} reviewed.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }
}