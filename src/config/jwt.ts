import jwt from "jsonwebtoken";
import * as process from "process";

export const generateAccessToken = (id: string): string => {
    return jwt.sign({id}, process.env.JWT_SECRET || "", {expiresIn: "1d"});
}

export const generateRefreshToken = (id: string): string => {
    return jwt.sign({id}, process.env.JWT_SECRET || "", {expiresIn: "3d"});
}
