import {NextFunction, Request, Response} from "express";
import {CustomError, handleResponseErrors} from "../../utils/responseResult";

export const routeNotFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new CustomError(`Not found: ${req.originalUrl}`, CustomError.NOT_FOUND);
    res.status(404);
    next(error);
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // const statusCode: number = res.statusCode == 200 ? 500 : res.statusCode;
    handleResponseErrors(res, err);
}