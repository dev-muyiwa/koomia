import {Request, Response} from "express";
import User, {Role} from "../models/UserSchema";
import {AuthenticatedRequest} from "../middlewares/auth";
import {validateDbId} from "../../utils/dbValidation";
import {CustomError, handleResponseErrors, sendResponse} from "../../utils/responseResult";
import bcrypt from "bcrypt";
import Wishlist from "../models/WishlistSchema";
import Cart from "../models/CartSchema";


const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const users: User[] = await User.where({role: Role.USER}).select("-password");
        const message: string = (users.length === 0) ? "No users found." : "All users returned.";

        return sendResponse(res, users, message);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const user: User | null = await User.findById(req.user?.id).select("-password");
        if (!user) {
            throw new CustomError("Profile not found.", CustomError.NOT_FOUND);
        }
        return sendResponse(res, user, `Profile retrieved.`);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const getSingleUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        validateDbId(req.params.id)
        const user: User | null = await User.findById(req.params.id).select("-password");
        if (!user) {
            throw new CustomError("User not found.", CustomError.NOT_FOUND);
        }
        return sendResponse(res, user, `User retrieved.`);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        validateDbId(req.user?.id)
        const user: User | null = await User.findByIdAndUpdate(req.user?.id, req.body, {new: true})
            .select("-password");
        if (!user) {
            throw new CustomError("User not found.", CustomError.NOT_FOUND);
        }
        return sendResponse(res, user, `User details updated.`);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const updatePassword = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        validateDbId(req.user?.id)

        const user: User | null = await User.findById(req.user?.id);
        // Check if their old password matches before allowing them to change it.
        if (!user) {
            throw new CustomError("User not found.", CustomError.NOT_FOUND);
        }
        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
            const date = new Date();
            user.password_updated_at = date.toISOString()
            await user.save();
        }
        return sendResponse(res, user, `Password updated.`);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        validateDbId(req.user?.id)

        const user: User | null = await User.findByIdAndDelete(req.user?.id);
        if (!user) {
            throw new CustomError("User not found.", CustomError.NOT_FOUND);
        }
        // Make sure to cascade delete.
        return sendResponse(res, null, `Account deleted.`);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const blockUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        validateDbId(req.params.id)

        const user: User | null = await User.findByIdAndUpdate(req.params.id,
            {is_blocked: true}, {new: true});
        if (!user) {
            throw new CustomError("User not found.", CustomError.NOT_FOUND);
        }
        return sendResponse(res, null, `Account deactivated.`);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const unblockUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        validateDbId(req.params.id)

        const user: User | null = await User.findByIdAndUpdate(req.params.id, {is_blocked: false}, {new: true});
        if (!user) {
            throw new CustomError("User not found.", CustomError.NOT_FOUND);
        }
        return sendResponse(res, null, `Account reactivated.`);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId: string = req.user?.id;
        const wishlist: Wishlist|null = await Wishlist.findOne({user: userId});
        if (!wishlist) {
            return sendResponse(res, null, "No item in wishlist");
        }

        return sendResponse(res, wishlist.products, "Wishlist gotten.");
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const getAllWishlists = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId: string = req.user?.id;
        const user: User = await User.findById(userId) as User;
        const wishlists: Wishlist = await Wishlist.findOne({user: user.id}) as Wishlist;

        return sendResponse(res, wishlists.products, "All wishlists gotten.");
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const getCart = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId: string = req.user?.id;
        const user: User = await User.findById(userId) as User;
        const cart: Cart = await Cart.findOne({order_by: user.id}).select(["products", "total_price", "-_id"]) as Cart;

        return sendResponse(res, cart, "User cart gotten.");
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

export const userController = {
    getAllUsers,
    getSingleUser,
    getUserProfile,
    updateUser,
    updatePassword,
    deleteUser,
    blockUser,
    unblockUser,
    getAllWishlists,
    getWishlist,
    getCart
}