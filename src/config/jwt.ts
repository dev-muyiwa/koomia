import jwt from "jsonwebtoken";
import * as process from "process";

const generateAccessToken = (id: string): string => {
    return jwt.sign({id}, process.env.JWT_SECRET || "", {expiresIn: "1d"});
}

const generateRefreshToken = (id: string): string => {
    return jwt.sign({id}, process.env.JWT_SECRET || "", {expiresIn: "3d"});
}

export const jwtService = {generateAccessToken, generateRefreshToken};
