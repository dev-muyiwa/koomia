import {Request, Response} from "express";
import Product from "../models/schema/ProductSchema";
import {sendError, sendResponse} from "../../utils/responseResult";
import {validateDbId} from "../../utils/dbValidation";
import slugify from "slugify";

// const create = asyncHandler(async (req: Request, res: Response) => {
//
// })

export class ProductController {
    public async createProduct(req: Request, res: Response) {
        try {
            if (req.body.title) {
                req.body.slug = slugify(req.body.title);
            }
            const product: Product = await Product.create(req.body);

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

            if(req.query.page){
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
}