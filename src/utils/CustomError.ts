export class CustomError extends Error {
    code: number;

    static BAD_REQUEST: number = 400;
    static UNAUTHORIZED: number = 401;
    static FORBIDDEN: number = 403;
    static NOT_FOUND: number = 404;
    static SERVER_ERROR: number = 500;

    constructor(message: string, code: number = CustomError.NOT_FOUND) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}