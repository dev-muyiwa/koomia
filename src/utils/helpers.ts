import {Types} from "mongoose";
import {CustomError} from "./CustomError";
import {maskEmail2, maskPhone} from "maskdata";

const validateMongooseId = (id: any, key?: string): void => {
    const isValid: boolean = Types.ObjectId.isValid(`${id}`);
    if (!isValid) {
        const tag: string = key ? key : "document";

        throw new CustomError(`Invalid ${tag} ID.`);
    }
}

const addMinutesToDate = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
}

const maskEmail = (email: string): string => {
    return maskEmail2(email, {
        maskWith: "*",
        unmaskedStartCharactersBeforeAt: 4,
        unmaskedEndCharactersAfterAt: 4
    })
}

const maskMobile = (mobile: string): string => {
    return maskPhone(mobile, {
        maskWith: "*",
        unmaskedStartDigits: 4,
        unmaskedEndDigits: 4
    })
}

export {validateMongooseId, addMinutesToDate, maskEmail, maskMobile}