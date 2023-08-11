import {Request, Response} from "express";
import {JwtPayload} from "jsonwebtoken";
import otpGenerator from "otp-generator";
import {token} from "morgan";
import bcrypt from "bcrypt";
import {WishlistModel} from "../models/WishlistSchema";
import {CartModel} from "../models/Cart";
import {UserDocument, UserModel} from "../models/User";
import {CustomError} from "../utils/CustomError";
import {AuthenticatedRequest, sendErrorResponse, sendSuccessResponse} from "../handlers/ResponseHandlers";
import MailService from "../services/MailService";
import {confirmRegistration} from "../templates/emails/confirm-registration";
import {addMinutesToDate, maskEmail} from "../utils/helpers";
import JwtService from "../services/JwtService";
import {config} from "../config/config";
import {passwordReset} from "../templates/emails/password-reset";

const signup = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {firstName, lastName, email, mobile, password} = req.body;
        const existingUser: UserDocument | null = await UserModel.findOne({
            $or: [{email: email}, {mobile: mobile}]
        });

        if (existingUser) {
            throw new CustomError("An account exists with this email/mobile.", CustomError.BAD_REQUEST);
        }
        const user: UserDocument = await new UserModel({
            firstName: firstName,
            lastName: lastName,
            email: email,
            mobile: mobile,
            password: await bcrypt.hash(password, config.server.bcrypt_rounds),
        }).save();

        await new WishlistModel({_id: user.id}).save();
        await new CartModel({user: user.id}).save();

        return sendSuccessResponse(res, user.getBasicInfo(), `Signup successful.`, 201);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {username, password} = req.body;
        const user: UserDocument | null = await UserModel.findOne({
            $or: [{email: username}, {mobile: username}]
        });
        const match: boolean | undefined = await user?.doesPasswordMatch(password);
        if (!user || !match) {
            throw new CustomError("Invalid login credentials.", CustomError.BAD_REQUEST);
        }

        if (user.isBlocked) {
            throw new CustomError("Account has been disabled. Contact an admin for more info.", CustomError.FORBIDDEN);
        }

        //TODO("Also check if the refresh token has expired.")
        const newRefreshToken: string = user.refreshToken ?? JwtService.generateRefreshToken(user.id, user.email)
        if (!user.refreshToken){
            await user.updateOne({refreshToken: newRefreshToken})
        }

        const tokens: object = {
            accessToken: JwtService.generateAccessToken(user.id, user.email),
            refreshToken: newRefreshToken
        }

        return sendSuccessResponse(res, tokens, "Login successful.")
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const startAccountVerification = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const user: UserDocument = req.user as UserDocument;
        const otp: string = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        user.otp = {
            code: otp,
            expiresAt: addMinutesToDate(new Date(), 20).toISOString()
        };

        MailService.sendMail(user.email, "Verify Account.", confirmRegistration(otp)).then(async () => {
            await user.save();
        });

        return sendSuccessResponse(res, null, `Confirmation email sent to ${maskEmail(user.email)}.`);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const verifyAccount = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const user: UserDocument = req.user as UserDocument;

        const otp: string = req.body.otp;

        if (!user.otp?.code || !user.otp?.expiresAt || user.otp.code !== otp) {
            throw new CustomError("Invalid OTP.", CustomError.BAD_REQUEST);
        }

        if (user.otp.expiresAt < new Date().toISOString()) {
            throw new CustomError("Expired OTP.", CustomError.BAD_REQUEST);
        }

        user.otp = undefined;
        user.isVerified = true

        await user.save();

        return sendSuccessResponse(res, null, "Account verification successful.");
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const handleRefreshToken = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {refreshToken} = req.body;
        const user: UserDocument | null = await UserModel.findOne({refreshToken: refreshToken});

        if (!user) {
            throw new CustomError("User does not exist.");
        }
        const decodedJwt: JwtPayload = JwtService.verifyRefreshToken(refreshToken);
        if (user.id !== decodedJwt.sub) {
            throw new CustomError("Invalid refresh token.", CustomError.BAD_REQUEST);
        }
        const accessToken: string = JwtService.generateAccessToken(user.id, user.email);

        return sendSuccessResponse(res, {accessToken: accessToken}, `Generated access token.`, 201);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {email} = req.body;
        const user: UserDocument | null = await UserModel.findOne({email: email.toLowerCase()});
        if (!user) {
            throw new CustomError("User with this email does not exist.");
        }
        const resetToken: string = await user.createPasswordResetToken();
        await user.save();

        const resetUrl: string = `${config.server.url}/api/auth/reset-password/${resetToken}`;

        await MailService.sendMail(email, "Reset password", passwordReset(resetUrl, user.firstName));

        return sendSuccessResponse(res, null, `Sent password reset mail to ${maskEmail(user.email)}.`);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const resetPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const resetToken: string | null = req.params.token;
        const newPassword = req.body.password;
        if (!token) {
            throw new CustomError("Invalid reset token.", CustomError.BAD_REQUEST);
        }
        const decodedJwt: JwtPayload = JwtService.verifyResetToken(resetToken);
        const user: UserDocument | null = await UserModel.findOne({
            _id: decodedJwt.sub,
            passwordResetToken: resetToken
        });
        if (!user) {
            throw new CustomError("Password reset token already used/expired.", CustomError.BAD_REQUEST);
        }

        await user.updateOne({
            password: await bcrypt.hash(newPassword, config.server.bcrypt_rounds),
            passwordResetToken: null,
            refreshToken: null
        });

        return sendSuccessResponse(res, null, `User password reset. Re-login to get access token.`)
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const logout = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const user: UserDocument = req.user as UserDocument;

        await user.updateOne({refreshToken: null});

        return sendSuccessResponse(res, null, `Logged out.`, 204);
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

export {
    signup,
    login,
    startAccountVerification,
    verifyAccount,
    handleRefreshToken,
    logout,
    forgotPassword,
    resetPassword,
}
