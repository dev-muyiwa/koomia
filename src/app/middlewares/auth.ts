import jwt, {JwtPayload} from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import * as process from "process";
import User, {Role} from "../models/UserSchema";
import multer, {Multer} from "multer";
import {CustomError, errorHandler} from "../../utils/responseResult";
import {validateDbId} from "../../utils/dbValidation";


export interface AuthenticatedRequest extends Request {
    user?: User;
}

export const validateBearerToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        let token;
        if (!req?.headers?.authorization?.startsWith("Bearer")) {
            throw new CustomError("Bearer token not found.", CustomError.NOT_FOUND);
        }
        token = req.headers.authorization.split(" ")[1];
        if (!token) {
            throw new CustomError("Invalid token.", CustomError.UNAUTHORIZED);
        }
        const decodedJwt: JwtPayload = jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayload;
        validateDbId(decodedJwt?.id);
        const user: User | null = await User.findById(decodedJwt?.id)
        if (!user) {
            throw new CustomError(`User not found.`, CustomError.NOT_FOUND);
        }
        if (user.is_blocked) {
            throw new CustomError("Account has been deactivated. Contact an admin", CustomError.UNAUTHORIZED);
        }
        req.user = user;
        return next()
    } catch (err) {
        return errorHandler(res, err);
    }
}

export const verifyAdminRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user: User | null = await User.findById(req.user?.id);
        if (!user) {
            throw new CustomError("User not found.", CustomError.NOT_FOUND);
        }
        if (user.role !== Role.ADMIN) {
            throw new CustomError("Missing permission to access this resource.", CustomError.FORBIDDEN);
        }
        return next();
    } catch (err) {
        return errorHandler(res, err)
    }
}

export const uploads = multer({
    storage: multer.diskStorage({}),
    limits: {fileSize: 5000000000}
})