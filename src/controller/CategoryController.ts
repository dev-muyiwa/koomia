import {Request, Response} from "express";
import {CategoryDocument, CategoryModel} from "../models/Category";
import {AuthenticatedRequest, sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {validateMongooseId} from "../utils/helpers";
import {CustomError} from "../utils/CustomError";
import {CategoryType} from "../models/enums/enum";
import {Types} from "mongoose";


const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const {name, parentId, type} = req.body;

        const existingCategory: CategoryDocument | null = await CategoryModel.findOne({name: name});
        if (existingCategory) {
            throw new CustomError("Category exists.", CustomError.BAD_REQUEST);
        }
        const newCategoryId: Types.ObjectId = new Types.ObjectId();
        let isNew: boolean = true;
        if (parentId) {
            validateMongooseId(parentId, "parent category");
            const parentCategory = await CategoryModel.findById(parentId);
            if (!parentCategory) {
                throw new CustomError("Parent category does not exist.");
            }
            await parentCategory.updateOne({
                $push: {subCategories: newCategoryId}
            });
            isNew = false;
        }

        const doc = (isNew) ? {
            _id: newCategoryId,
            name: name,
            type: type
        } : {
            _id: newCategoryId,
            name: name,
            parent: parentId
        };

        const category: CategoryDocument = await new CategoryModel(doc).save();

        return sendSuccessResponse(res, category, "Category created.", 201);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const getCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {type} = req.query;

        const query = type ?? CategoryType.PRODUCT;
        const categories: CategoryDocument[] = await CategoryModel.find({type: query}).populate("subCategories");

        return sendSuccessResponse(res, categories, "Categories fetched.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const getCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {categoryId} = req.params;
        validateMongooseId(categoryId, "category");
        const category: CategoryDocument | null = await CategoryModel.findById(categoryId)?.populate("subCategories");
        if (!category) {
            throw new CustomError("Category does not exist.");
        }
        return sendSuccessResponse(res, category, `Category fetched.`);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const {categoryId} = req.params;
        const {name} = req.body;
        validateMongooseId(categoryId, "category");
        const category: CategoryDocument | null = await CategoryModel.findByIdAndUpdate(categoryId,
            {name: name}, {new: true});
        if (!category) {
            throw new CustomError("Category does not exist.");
        }

        return sendSuccessResponse(res, category, "Category updated.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const {categoryId} = req.params;
        validateMongooseId(categoryId, "category");

        const category: CategoryDocument | null = await CategoryModel.findById(categoryId);
        if (!category) {
            throw new CustomError("Category does not exist.");
        }

        for (const sub of category.subCategories) {
            await CategoryModel.findByIdAndDelete(sub);
        }

        await CategoryModel.findByIdAndUpdate(category.parent, {
            $pull: {
                subCategories: categoryId
            }
        });

        await CategoryModel.findByIdAndDelete(categoryId);

        return sendSuccessResponse(res, null, "Category deleted.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}


export {
    createCategory, getCategories, getCategory, updateCategory, deleteCategory
}