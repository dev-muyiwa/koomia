import {Request, Response} from "express";
import User from "../models/UserSchema";
import {generateRefreshToken, generateAccessToken} from "../../config/jwt";
import {AuthenticatedRequest} from "../middlewares/auth";
import {validateDbId} from "../../utils/dbValidation";
import jwt, {JwtPayload} from "jsonwebtoken";
import {sendError, sendResponse} from "../../utils/responseResult";
import process from "process";
import {MailingData, sendMail} from "../../services/mailingService";
import {token} from "morgan";
import bcrypt from "bcrypt";
import crypto from "crypto";

export class UserController {
    public async registerUser(req: Request, res: Response) {
        try {
            const existingUser: User | null = await User.findOne({email: req.body.email}) ||
                await User.findOne({mobile: req.body.mobile});

            if (existingUser) {
                throw new Error("An account exists with this email/mobile.");
            }
            const newUser: User = await User.create(req.body);

            return sendResponse(res, newUser, `User ${newUser.id} created.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async loginUser(req: Request, res: Response) {
        try {
            const existingUser: User | null = await User.findOne({email: req.body.email});
            if (!existingUser || !await existingUser.doesPasswordMatch(req.body.password)) {
                throw new Error("Invalid credentials.");
            }
            const refreshToken: string = generateRefreshToken(existingUser.id);
            await User.findByIdAndUpdate(existingUser.id, {refresh_token: refreshToken})
            res.cookie("refresh_token", refreshToken, {httpOnly: true, maxAge: 72 * 60 * 60 * 1000});

            const response: object = {
                id: existingUser.id,
                first_name: existingUser.first_name,
                last_name: existingUser.last_name,
                email: existingUser.email,
                role: existingUser.role,
                access_token: generateAccessToken(existingUser.id)
            };
            return sendResponse(res, response, "Access token obtained.")

        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async getAllUsers(req: Request, res: Response) {
        try {
            const users: User[] = await User.where({role: "user"}).select("-password");
            const message: string = (users.length === 0) ? "No users found." : "All users returned.";
            return sendResponse(res, users, message);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async getSingleUser(req: Request, res: Response) {
        try {
            validateDbId(req.params.id)
            const user: User | null = await User.findById(req.params.id).select("-password");
            if (!user) {
                throw new Error("User not found.");
            }
            return sendResponse(res, user, `User ${user.id} retrieved.`);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async updateUser(req: AuthenticatedRequest, res: Response) {
        try {
            validateDbId(req.user?.id)
            const user: User | null = await User.findByIdAndUpdate(req.user?.id, req.body, {new: true});
            if (!user) {
                throw new Error("User not found.");
            }
            return sendResponse(res, user, `User ${user.id} updated.`);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async updatePassword(req: AuthenticatedRequest, res: Response) {
        try {
            validateDbId(req.user?.id)

            const user: User | null = await User.findById(req.user?.id);
            if (!user) {
                throw new Error("User not found.");
            }
            if (req.body.password) {
                user.password = req.body.password;
                await user.save();
            }
            return sendResponse(res, user, `User ${user.id} password updated.`);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async deleteUser(req: AuthenticatedRequest, res: Response) {
        try {
            validateDbId(req.user?.id)

            const user: User | null = await User.findByIdAndDelete(req.user?.id);
            if (!user) {
                throw new Error("User not found.");
            }
            return sendResponse(res, user, `User ${user.id} deleted.`);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async blockUser(req: Request, res: Response) {
        try {
            // const user: User | null = await User.findById(req.params.id);
            // if (!user) {
            //     throw new Error("User not found.");
            // }
            // if (user.role === Role.ADMIN){
            //     throw new Error("Unable to block admin user.");
            // }
            // user.updateOne({isBlocked: true}, {new: true});
            // user.save();
            validateDbId(req.params.id)

            const user: User | null = await User.findByIdAndUpdate(req.params.id, {is_blocked: true}, {new: true});
            if (!user) {
                throw new Error("User not found.");
            }
            return sendResponse(res, user, `User ${user.id} added to blacklist.`);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async unblockUser(req: Request, res: Response) {
        try {
            validateDbId(req.params.id)

            const user: User | null = await User.findByIdAndUpdate(req.params.id, {is_blocked: false}, {new: true});
            if (!user) {
                throw new Error("User not found.");
            }
            return sendResponse(res, user, `User ${user.id} removed from blacklist.`);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async handleRefreshToken(req: Request, res: Response) {
        try {
            const cookies = req.cookies;
            if (!cookies.refresh_token) {
                throw new Error("No refresh token in cookies.");
            }
            const refreshToken = cookies.refresh_token;
            const user: User | null = await User.findOne({refresh_token: refreshToken});

            if (!user) {
                throw new Error("No refresh token found in Db.");
            }
            const decodedJwt: JwtPayload = jwt.verify(refreshToken, process.env.JWT_SECRET || "") as JwtPayload;
            if (user.id !== decodedJwt.id) {
                throw new Error("Invalid refresh token.");
            }
            const accessToken: string = generateAccessToken(user.id)

            return sendResponse(res, accessToken, `Access token generated.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async logoutUser(req: Request, res: Response) {
        try {
            const cookies = req.cookies;
            if (!cookies.refresh_token) {
                throw new Error("No refresh token in cookies.");
            }
            const refreshToken = cookies.refresh_token;
            const user: User | null = await User.findOne({refresh_token: refreshToken});

            if (user) {
                await User.findOneAndUpdate({refresh_token: refreshToken}, {refresh_token: null});
            }
            res.clearCookie("refresh_token", {httpOnly: true, secure: true});
            return sendResponse(res, null, `User ${user?.id} logged out.`, 204);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async forgotPassword(req: Request, res: Response) {
        try {
            const user: User | null = await User.findOne({email: req.body.email});
            if (!user) {
                throw new Error("User not found.");
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

            return sendResponse(res, token, `Reset mail sent to User ${user.id}.`);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async resetPassword(req: Request, res: Response) {
        try {
            let resetToken: string | null = req.params.token;
            const newPassword = req.body.password;
            if (!token) {
                throw new Error("Invalid reset token.")
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
                throw new Error("Password reset token already used/expired.");
            }
            user.password = await bcrypt.hash(newPassword, 10);
            user.password_reset_token = undefined;
            user.password_token_expiration = undefined;

            await user.save();

            return sendResponse(res, null, `User ${user.id} password reset successfully.`)
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }
}