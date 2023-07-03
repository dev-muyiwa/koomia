import jwt, {JwtPayload} from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import * as process from "process";
import User, {Role} from "../models/UserSchema";


export interface AuthenticatedRequest extends Request {
    user?: User;
}

export const validateBearerToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        let token;
        if (!req?.headers?.authorization?.startsWith("Bearer")) {
            throw new Error("Bearer token not found.");
        }
        token = req.headers.authorization.split(" ")[1];
        if (!token) {
            throw new Error("Invalid token.");
        }
        const decodedJwt: JwtPayload = jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayload;
        const user: User | null = await User.findById(decodedJwt?.id)
        if (!user) {
            throw new Error(`User not found.`);
        }
        req.user = user;
        return next()
    } catch (err) {
        return res.status(500).json({success: false, message: err.message});
    }
}

export const verifyAdminRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user: User | null = await User.findById(req.user?._id);
        if (!user) {
            throw new Error("User not found (b).");
        }
        if (user.role !== Role.ADMIN) {
            throw new Error("Resource is restricted to admins alone.");
        }
        return next();
    } catch (err) {
        return res.status(500).json({success: false, message: err.message});
    }
}