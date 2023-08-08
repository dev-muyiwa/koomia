import {AuthenticatedRequest, sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {Request, Response} from "express";
import {UserDocument, UserModel} from "../models/User";
import {Role} from "../models/enums/enum";
import {validateMongooseId} from "../utils/helpers";
import {CustomError} from "../utils/CustomError";
import {CategoryDocument, CategoryModel} from "../models/Category";
import {Types} from "mongoose";

const getUsers = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const users: UserDocument[] = await UserModel.find({role: Role.USER});
        const message: string = (users.length === 0) ? "No users found." : "All users returned.";
        const newUsers = users.map((user) => user.getBasicInfo());

        return sendSuccessResponse(res, newUsers, message);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const getUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {userId} = req.params;
        const user: UserDocument | null = await UserModel.findById(userId);
        if (!user) {
            throw new CustomError("User does not exist.");
        }

        return sendSuccessResponse(res, user.getBasicInfo(), "User fetched.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const blockUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const admin: UserDocument = req.user as UserDocument;
        const {userId} = req.params;
        validateMongooseId(userId, "user");
        if (admin.id === userId) {
            throw new CustomError("You cannot block yourself.", CustomError.BAD_REQUEST);
        }
        const user: UserDocument | null = await UserModel.findByIdAndUpdate(userId, {isBlocked: true});
        if (!user) {
            throw new CustomError("User does not exist.");
        }

        return sendSuccessResponse(res, null, "User has been blocked.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const unblockUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const admin: UserDocument = req.user as UserDocument;
        const {userId} = req.params;
        validateMongooseId(userId, "user");
        if (admin.id === userId) {
            throw new CustomError("You cannot block yourself.", CustomError.BAD_REQUEST);
        }
        const user: UserDocument | null = await UserModel.findByIdAndUpdate(userId, {isBlocked: false});
        if (!user) {
            throw new CustomError("User does not exist.");
        }

        return sendSuccessResponse(res, null, "User has been unblocked.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const {name, parentId, type} = req.body;

        const existingCategory: CategoryDocument | null = await CategoryModel.findOne({name: name});
        if (existingCategory) {
            throw new CustomError("Category exists.", CustomError.BAD_REQUEST);
        }
        const newCategoryId: Types.ObjectId = new Types.ObjectId();
        if (parentId) {
            validateMongooseId(parentId, "parent category");
            const parentCategory = await CategoryModel.findById(parentId);
            if (!parentCategory) {
                throw new CustomError("Parent category does not exist.");
            }
            await parentCategory.updateOne({
                $push: {subCategories: newCategoryId}
            });
        }

        const category: CategoryDocument = await new CategoryModel({
            _id: newCategoryId,
            name: name,
            type: type
        }).save();

        return sendSuccessResponse(res, category, "Category created.", 201);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

// const getCategory = async (req: AuthenticatedRequest, res: Response) => {
//     const category = await CategoryModel.findById(req.params.categoryId).populate("subCategories");
//
//     return sendSuccessResponse(res, category, "Category fetched.");
// }

const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const {categoryId} = req.params;
        const {name} = req.body;
        validateMongooseId(categoryId, "category");
        const category: CategoryDocument | null = await CategoryModel.findByIdAndUpdate(categoryId, {name: name}, {new: true});
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

        await CategoryModel.findByIdAndDelete(categoryId);

        return sendSuccessResponse(res, category, "Category deleted.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

export {
    getUsers, getUser, blockUser, unblockUser, createCategory, updateCategory, deleteCategory
}