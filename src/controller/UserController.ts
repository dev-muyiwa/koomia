import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {UserDocument, UserModel} from "../models/User";
import {AuthenticatedRequest, sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {config} from "../config/config";
import {CustomError} from "../utils/CustomError";
import CloudinaryService from "../services/CloudinaryService";
import {UploadApiResponse} from "cloudinary";
import {WishlistDocument, WishlistModel} from "../models/WishlistSchema";
import {ProductDocument} from "../models/Product";

const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const user: UserDocument = req.user as UserDocument;

        return sendSuccessResponse(res, user.getBasicInfo(), `Profile retrieved.`);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const user: UserDocument = req.user as UserDocument;
        const {firstName, lastName, email, mobile} = req.body;
        await user.updateOne({
            firstName: firstName ?? user.firstName,
            lastName: lastName ?? user.lastName,
            email: email ?? user.email,
            mobile: mobile ?? user.mobile
        })
        return sendSuccessResponse(res, null, `User profile updated.`);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const updatePassword = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const user: UserDocument = req.user as UserDocument;
        const {oldPassword, newPassword} = req.body;

        if (!await user.doesPasswordMatch(oldPassword)){
            throw new CustomError("Old password does not match current password.", CustomError.BAD_REQUEST);
        }

        if (oldPassword === newPassword) {
            throw new CustomError("New password cannot be the same as current password.", CustomError.BAD_REQUEST);
        }

        await user.updateOne({password: await bcrypt.hash(newPassword, config.server.bcrypt_rounds)});

        return sendSuccessResponse(res, null, `Password updated.`);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const addAvatar = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const avatar: Express.Multer.File | undefined = req.file;
        if (!avatar || !avatar.mimetype.startsWith("image/")) {
            throw new CustomError("Upload a picture.", CustomError.BAD_REQUEST);
        }
        const user: UserDocument = req.user as UserDocument;

        const uploadResponse: UploadApiResponse = await CloudinaryService.uploadMedia(avatar.path, {
            public_id: `koomia/users/${user.id}/avatar/0`,
            use_filename: true,
            resource_type: "image"
        });
        await user.updateOne({
            avatar: {
                url: uploadResponse.secure_url,
                publicId: uploadResponse.public_id,
            }
        });

        return sendSuccessResponse(res, null, "User avatar added.")
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const removeAvatar = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const user: UserDocument = req.user as UserDocument;
        if (!user.avatar) {
            throw new CustomError("No avatar found.");
        }

        await CloudinaryService.deleteMedia(user.avatar.publicId)
        await user.updateOne({
            avatar: {}
        })

        return sendSuccessResponse(res, null, "Avatar removed.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

//
// const addAddress = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
//     try {
//         const userId: string = req.user?.id;
//         const user: UserModel = await
//
//     } catch (err) {
//         return errorHandler(res, err);
//     }
// }
//
const getWishlists = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const wishlist: WishlistDocument = await WishlistModel.findById(req.user!!.id).populate("products") as WishlistDocument;

        // @ts-ignore
        const data = wishlist.products.map((product: ProductDocument) => product.getBasicInfo());

        return sendSuccessResponse(res, data, "Your wishlists fetched.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

export {
    getProfile,
    updateProfile,
    updatePassword,
    addAvatar,
    removeAvatar,
    getWishlists
}