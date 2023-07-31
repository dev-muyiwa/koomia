import {Request, Response} from "express";
import {CustomError, errorHandler, responseHandler} from "../../utils/responseResult";
import {validateDbId} from "../../utils/dbValidation";
import Category, {CategoryType} from "../models/CategorySchema";

const createCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        if (!Object.values(CategoryType).includes(req.body.category)) {
            throw new CustomError("Invalid category type.", CustomError.FORBIDDEN);
        }
        const category: Category = await Category.create({
            title: req.body.title,
            category: req.body.category
        });
        return responseHandler(res, category, `Category ${category.title} created.`, 201);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getAllCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
        const categories: Category[] = await Category.find({category: req.body.category});

        return responseHandler(res, categories, "All categories gotten.");
    } catch (err) {
        return errorHandler(res, err);
    }
}

const getCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id: string = req.params.id;
        validateDbId(id);
        const category: Category | null = await Category.findById(id);
        if (!category) {
            throw new CustomError("Category not found.", CustomError.NOT_FOUND);
        }
        return responseHandler(res, category, `Category ${category.title} gotten.`);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const updateCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id: string = req.params.id;
        validateDbId(id);
        const category: Category | null = await Category.findByIdAndUpdate(id, {
            title: req.body.category
        }, {new: true});
        if (!category) {
            throw new CustomError("Category not found.", CustomError.NOT_FOUND);
        }
        return responseHandler(res, category, `Category ${category.title} updated.`, 201);
    } catch (err) {
        return errorHandler(res, err);
    }
}

const deleteCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id: string = req.params.id;
        validateDbId(id);
        const category: Category | null = await Category.findByIdAndDelete(id);
        if (!category) {
            throw new CustomError("Category not found.", CustomError.NOT_FOUND);
        }
        return responseHandler(res, null, ` Category ${category.title} deleted.`);
    } catch (err) {
        return errorHandler(res, err);
    }
}

export const categoryController = {
    createCategory, getAllCategories, getCategory, updateCategory, deleteCategory
}