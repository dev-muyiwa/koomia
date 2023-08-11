import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {UserDocument, UserModel} from "../models/User";
import {AuthenticatedRequest, sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import {config} from "../config/config";
import {CustomError} from "../utils/CustomError";
import CloudinaryService from "../services/CloudinaryService";
import {UploadApiResponse} from "cloudinary";
import {WishlistDocument, WishlistModel} from "../models/Wishlist";
import {ProductDocument} from "../models/Product";
import {AddressDocument, AddressModel} from "../models/AddressBook";
import {CartDocument, CartItem, CartModel} from "../models/Cart";
import {OrderDocument, OrderModel} from "../models/Order";
import {OrderStatus} from "../models/enums/enum";
import {Types} from "mongoose";

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

        if (!await user.doesPasswordMatch(oldPassword)) {
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

const addAddress = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const user: UserDocument = req.user as UserDocument;
        const {firstName, lastName, primaryMobile, secondaryMobile, address, moreInfo, region, city} = req.body;

        const addressBook: AddressDocument = await new AddressModel({
            user: user.id,
            firstName: firstName,
            lastName: lastName,
            primaryMobile: primaryMobile,
            secondaryMobile: secondaryMobile ? secondaryMobile : null,
            address: address,
            moreInfo: moreInfo ? moreInfo : null,
            region: region,
            city: city,
        }).save();


        return sendSuccessResponse(res, addressBook, "Address Book added.")
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const updateAddress = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const user: UserDocument = req.user as UserDocument;
        const {addressId} = req.params;
        const {firstName, lastName, primaryMobile, secondaryMobile, address, moreInfo, region, city} = req.body;

        const addressBook: AddressDocument | null = await AddressModel.findOneAndUpdate({
            _id: addressId,
            user: user.id
        }, {
            firstName: firstName,
            lastName: lastName,
            primaryMobile: primaryMobile,
            secondaryMobile: secondaryMobile,
            address: address,
            moreInfo: moreInfo,
            region: region,
            city: city
        }, {new: true});

        if (!addressBook) {
            throw new CustomError("Address book does not exist.")
        }

        return sendSuccessResponse(res, addressBook, "Address Book updated.")
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}


const deleteAddress = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const user: UserDocument = req.user as UserDocument;
        const {addressId} = req.params;

        const addressBook: AddressDocument | null = await AddressModel.findOneAndDelete({
            _id: addressId,
            user: user.id
        });
        if (!addressBook) {
            throw new CustomError("Address does not exist.");
        }

        return sendSuccessResponse(res, null, "Address Book deleted.")
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const getWishlists = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const wishlist: WishlistDocument = await WishlistModel.findById(req.user!!.id)
            .populate("products") as WishlistDocument;

        // @ts-ignore
        const data: Object[] = wishlist.products.map((product: ProductDocument) => product.getBasicInfo());

        return sendSuccessResponse(res, data, "Your wishlists fetched.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const checkoutCart = async(req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const {addressId} = req.body
        const user: UserDocument = req.user as UserDocument;
        const cart: CartDocument = await CartModel.findOne({user: user.id}).populate(["product"]) as CartDocument;

        const address: AddressDocument|null = await AddressModel.findOne({_id: addressId, user: user.id});
        if (!address){
            throw new CustomError("Address does not exist.");
        }

        const newOrder: OrderDocument = new OrderModel({
            user: user.id,
            status: OrderStatus.PENDING,
            address: address.id,
            items: cart.items
        });
    } catch (err){
        return sendErrorResponse(res, err);
    }
}

export {
    getProfile,
    updateProfile,
    updatePassword,
    addAvatar,
    removeAvatar,
    getWishlists,
    addAddress,
    updateAddress,
    deleteAddress
}