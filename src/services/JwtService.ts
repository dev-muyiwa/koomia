import jwt, {JwtPayload} from "jsonwebtoken";
import {config} from "../config/config";


const generateAccessToken = (userId: string, email: string): string => {
    const payload = {
        sub: userId,
        email: email.trim()
    }
    return jwt.sign(payload, config.server.jwt_access_secret, {expiresIn: "30m"});
}


const generateRefreshToken = (userId: string, email: string): string => {
    const payload = {
        sub: userId,
        email: email.trim()
    }
    return jwt.sign(payload, config.server.jwt_refresh_secret, {expiresIn: "7d"});
}

const generateResetToken = (userId: string, email: string): string => {
    const payload = {
        sub: userId,
        email: email.trim()
    }
    return jwt.sign(payload, config.server.jwt_reset_secret, {expiresIn: "20m"});
}

const verifyAccessToken = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, config.server.jwt_access_secret) as JwtPayload;
    } catch (err) {
        throw err
    }
}

const verifyRefreshToken = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, config.server.jwt_refresh_secret) as JwtPayload;
    } catch (err) {
        throw err
    }
}

const verifyResetToken = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, config.server.jwt_reset_secret) as JwtPayload;
    } catch (err) {
        throw err
    }
}

export default {
    generateAccessToken, generateRefreshToken, generateResetToken,
    verifyAccessToken, verifyRefreshToken, verifyResetToken
}

