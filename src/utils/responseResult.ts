import {Response} from "express";

export const sendResponse = (res: Response, data: any | null = null, message: string, code: number = 200): Response => {
    return res.status(code).json({success: true, data: data, message: message});
}

const sendError = (res: Response, error: object | null = null, message: string, code: number = 500): Response => {
    return res.status(code).json({success: false, error: error, message: message});
}

export const handleResponseErrors = (res: Response, err: any) => {
    if (err instanceof CustomError) {
        return sendError(res, null, err.message, err.code)
    } else {
        return sendError(res, err, err.message)
    }
}

export class CustomError extends Error {
    code: number;

    static BAD_REQUEST: number = 400;
    static UNAUTHORIZED: number = 401;
    static PAYMENT_REQUIRED: number = 402;
    static FORBIDDEN: number = 403;
    static NOT_FOUND: number = 404;
    static METHOD_NOT_ALLOWED: number = 405;
    static CONFLICT: number = 409;

    constructor(message: string, code: number = 400) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}