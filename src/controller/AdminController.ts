import {AuthenticatedRequest, sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {Request, Response} from "express";
import {UserDocument, UserModel} from "../models/User";
import {Role} from "../models/enums/enum";
import {validateMongooseId} from "../utils/helpers";
import {CustomError} from "../utils/CustomError";

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


export {
    getUsers, getUser, blockUser, unblockUser
}