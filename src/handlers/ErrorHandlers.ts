import {NextFunction, Request, Response} from "express";
import {sendErrorResponse} from "./ResponseHandlers";
import {CustomError} from "../utils/CustomError";


const routeNotFound = (req: Request, res: Response, next: NextFunction): void => {
    const error = new CustomError(`Not found: ${req.url}`);
    sendErrorResponse(res, error);
}

const apiErrorHandler = (err: Error, req: Request, res: Response): void => {
    sendErrorResponse(res, err);
}

export {
    routeNotFound, apiErrorHandler
}