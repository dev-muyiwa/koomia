import {JwtPayload} from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import {AuthenticatedRequest, sendErrorResponse} from "../handlers/ResponseHandlers";
import {CustomError} from "../utils/CustomError";
import {validateMongooseId} from "../utils/helpers";
import {UserDocument, UserModel} from "../models/User";
import JwtService from "../services/JwtService";
import {Role} from "../models/enums/enum";


const checkValidationErrors = (req: Request, res: Response, next: NextFunction): Response | void => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return sendErrorResponse(res, error, "Validation errors.");
    }
    return next();
}

const checkAuthorizationToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        let token;
        if (!req?.headers?.authorization?.startsWith("Bearer")) {
            throw new CustomError("Bearer token isn't attached to request header.");
        }
        token = req.headers.authorization.split(" ")[1];
        if (!token) {
            throw new CustomError("Invalid bearer token.", CustomError.BAD_REQUEST);
        }
        const decodedJwt: JwtPayload = JwtService.verifyAccessToken(token);
        validateMongooseId(decodedJwt?.sub, "user");

        const user: UserDocument | null = await UserModel.findOne({_id: decodedJwt?.sub, email: decodedJwt?.email})
        if (!user || !user.refreshToken) {
            throw new CustomError(`User attached to this token does not exist.`);
        }
        if (user.isBlocked) {
            throw new CustomError("Account has been deactivated. Contact an administrator.", CustomError.FORBIDDEN);
        }

        req.user = user;
        return next()
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const checkVerificationStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const user: UserDocument = req.user as UserDocument;
        if (user.role === Role.ADMIN || user.isVerified) {
            return next();
        } else {
            throw new CustomError("Account has not been verified. Verify your email address or mobile.", CustomError.UNAUTHORIZED);
        }
    } catch (err) {
        return sendErrorResponse(res, err);
    }
}

const verifyAdminRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user || req.user.role !== Role.ADMIN) {
            throw new CustomError("Missing permission to access this resource.", CustomError.FORBIDDEN);
        }
        return next();
    } catch (err) {
        return sendErrorResponse(res, err)
    }
}

export {checkValidationErrors, checkAuthorizationToken, checkVerificationStatus, verifyAdminRole}
