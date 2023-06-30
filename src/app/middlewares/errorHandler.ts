import {NextFunction, Request, Response} from "express";
import {sendError} from "../../utils/responseResult";

export const routeNotFound = (req: Request, res: Response, next: NextFunction) => {
    const error: Error = new Error(`Not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode: number = res.statusCode == 200 ? 500 : res.statusCode;
    sendError(res, err, err.message, statusCode);
    // res.status(statusCode)
    //     .json({
    //         success: false,
    //         message: err.message,
    //         error: err.stack
    //     });
}