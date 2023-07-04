import jwt, {JwtPayload} from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import * as process from "process";
import User, {Role} from "../models/UserSchema";
import multer, {Multer} from "multer";


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
            throw new Error("User not found.");
        }
        if (user.role !== Role.ADMIN) {
            throw new Error("Resource is restricted to admins alone.");
        }
        return next();
    } catch (err) {
        return res.status(500).json({success: false, message: err.message});
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the directory where you want to save the uploaded files
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Use the original file name or generate a unique name
        cb(null, file.originalname);
    }
});

export const uploads = multer({
    storage: multer.diskStorage({}),
    limits: {fileSize: 5000000000}
})