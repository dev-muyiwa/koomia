import {Request, Response} from "express";
import User from "../models/UserSchema";
import {jwtService} from "../../config/jwt";
import jwt, {JwtPayload} from "jsonwebtoken";
import {CustomError, handleResponseErrors, sendResponse} from "../../utils/responseResult";
import process from "process";
import {MailingData, sendMail} from "../../services/mailingService";
import {token} from "morgan";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {AuthenticatedRequest} from "../middlewares/auth";
import Wishlist from "../models/WishlistSchema";
import Cart from "../models/CartSchema";

const registerUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const existingUser: User | null = await User.findOne({email: req.body.email}) ||
            await User.findOne({mobile: req.body.mobile});

        if (existingUser) {
            throw new CustomError("An account exists with this email/mobile.", CustomError.CONFLICT);
        }
        const newUser: User = await User.create(req.body);
        const wishlists: Wishlist = await Wishlist.create({user: newUser.id});
        await wishlists.save();

        const cart: Cart = await Cart.create({order_by: newUser.id});
        await cart.save();

        return sendResponse(res, newUser, `Account created.`, 201);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const existingUser: User | null = await User.findOne({email: req.body.email});
        const match: boolean|undefined = await existingUser?.doesPasswordMatch(req.body.password);
        if (!existingUser || !match) {
            throw new CustomError("Invalid login credentials.", CustomError.BAD_REQUEST);
        }
        if (existingUser.is_blocked) {
            throw new CustomError("Account has been deactivated. Contact an admin", CustomError.UNAUTHORIZED);
        }
        const refreshToken: string = jwtService.generateRefreshToken(existingUser.id);
        await User.findByIdAndUpdate(existingUser.id, {refresh_token: refreshToken})
        res.cookie("refresh_token", refreshToken, {httpOnly: true, maxAge: 72 * 60 * 60 * 1000});

        const response: object = {
            id: existingUser.id,
            first_name: existingUser.first_name,
            last_name: existingUser.last_name,
            email: existingUser.email,
            role: existingUser.role,
            access_token: jwtService.generateAccessToken(existingUser.id)
        };

        return sendResponse(res, response, "Access token generated.")
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const handleRefreshToken = async (req: Request, res: Response): Promise<Response> => {
    try {
        const cookies = req.cookies;
        if (!cookies.refresh_token) {
            throw new CustomError("Refresh token not found.", CustomError.NOT_FOUND);
        }
        const refreshToken = cookies.refresh_token;
        const user: User | null = await User.findOne({refresh_token: refreshToken});

        if (!user) {
            throw new CustomError("Refresh token not attached to a user.", CustomError.NOT_FOUND);
        }
        const decodedJwt: JwtPayload = jwt.verify(refreshToken, process.env.JWT_SECRET || "") as JwtPayload;
        if (user.id !== decodedJwt.id) {
            throw new CustomError("Refresh token is invalid.", CustomError.BAD_REQUEST);
        }
        const accessToken: string = jwtService.generateAccessToken(user.id)

        return sendResponse(res, accessToken, `Access token generated.`, 201);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const logoutUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const cookies = req.cookies;
        if (!cookies.refresh_token) {
            throw new CustomError("No refresh token in cookies.", CustomError.NOT_FOUND);
        }
        const refreshToken = cookies.refresh_token;
        const user: User | null = await User.findOne({refresh_token: refreshToken});
        if (user?.id !== req.user?.id) {
            throw new CustomError("Unable to logout.", CustomError.FORBIDDEN);
        }
        if (user) {
            await User.findOneAndUpdate({refresh_token: refreshToken}, {refresh_token: null});
        }
        res.clearCookie("refresh_token", {httpOnly: true, secure: true});

        return sendResponse(res, null, `User logged out.`, 204);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const user: User | null = await User.findOne({email: req.body.email});
        if (!user) {
            throw new CustomError("User not found.", CustomError.NOT_FOUND);
        }
        const token: string = await user.createPasswordResetToken();
        await user.save();

        const resetUrl: string = `Holla! Follow this link to reset your password. Valid for only 20 minutes.` +
            `<a href='http://localhost:5000/api/v1/user/reset-password/${token}'>Click here.</a>`;
        const passwordResetData: MailingData = new MailingData();
        passwordResetData.to = [user.email];
        passwordResetData.subject = "Forgot Password";
        passwordResetData.body = `Howdy, ${user.first_name}`;
        passwordResetData.html = resetUrl;

        await sendMail(passwordResetData);

        return sendResponse(res, null, `Reset mail sent to User.`);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const resetPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        let resetToken: string | null = req.params.token;
        const newPassword = req.body.password;
        if (!token) {
            throw new CustomError("Invalid reset token.", CustomError.BAD_REQUEST);
        }
        resetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        const user: User | null = await User.findOne({
            password_reset_token: resetToken,
            password_token_expiration: {$gt: Date.now()}
        });
        if (!user) {
            throw new CustomError("Password reset token already used/expired.", CustomError.CONFLICT);
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.password_reset_token = undefined;
        user.password_token_expiration = undefined;
        const date: Date = new Date();
        user.password_updated_at = date.toISOString();

        await user.save();

        return sendResponse(res, null, `Password reset successfully.`)
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

export const authController = {
    registerUser,
    loginUser,
    handleRefreshToken,
    logoutUser,
    forgotPassword,
    resetPassword,
}