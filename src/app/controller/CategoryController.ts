import {Request, Response} from "express";
import {sendError, sendResponse} from "../../utils/responseResult";
import {validateDbId} from "../../utils/dbValidation";
import Category, {CategoryType} from "../models/CategorySchema";

export class CategoryController {
    public async createCategory(req: Request, res: Response) {
        try {
            if(!Object.values(CategoryType).includes(req.body.category)) {
                throw new Error("Invalid category type.");
            }
            const category: Category = await Category.create({
                title: req.body.title,
                category: req.body.category
            });
            return sendResponse(res, category, `Category ${category.title} created.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async createBlogCategory(req: Request, res: Response) {
        try {
            const category: Category = await Category.create({
                title: req.body.title,
                category: CategoryType.BLOG
            });
            return sendResponse(res, category, `Category ${category.title} created.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async createBrandCategory(req: Request, res: Response) {
        try {
            const category: Category = await Category.create({
                title: req.body.title,
                category: CategoryType.BRAND
            });
            return sendResponse(res, category, `Category ${category.title} created.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async getAllCategories(req: Request, res: Response) {
        try {
            const categories: Category[] = await Category.find({category: req.body.category});

            return sendResponse(res, categories, "All categories gotten.");
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async getCategory(req: Request, res: Response) {
        try {
            const id: string = req.params.id;
            validateDbId(id);
            const category: Category | null = await Category.findById(id);
            if (!category) {
                throw new Error("Category not found.");
            }
            return sendResponse(res, category, `Category ${category.title} gotten.`);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async updateCategory(req: Request, res: Response) {
        try {
            const id: string = req.params.id;
            validateDbId(id);
            const category: Category | null = await Category.findByIdAndUpdate(id, {
                title: req.body.category
            }, {new: true});
            if (!category) {
                throw new Error("Category not found.");
            }
            return sendResponse(res, category, `Category ${category.title} updated.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async deleteCategory(req: Request, res: Response) {
        try {
            const id: string = req.params.id;
            validateDbId(id);
            const category: Category | null = await Category.findByIdAndDelete(id);
            if (!category) {
                throw new Error("Category not found.");
            }
            return sendResponse(res, null, ` Category ${category.title} deleted.`);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }
}