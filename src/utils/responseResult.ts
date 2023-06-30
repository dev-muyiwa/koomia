import {Response} from "express";

export const sendResponse = (res: Response, data: any | null = null, message: string, code: number = 200): Response => {
    return res.status(code).json({success: true, data: data, message: message});
}

export const sendError = (res: Response, error: object | null = null, message: string, code: number = 500): Response => {
    return res.status(code).json({success: false, error: error, message: message});
}