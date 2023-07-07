import {Types} from "mongoose";
import {CustomError} from "./responseResult";

export const validateDbId = (id: string) => {
    const isValid: boolean = Types.ObjectId.isValid(id);
    if (!isValid){
        throw new CustomError("Invalid ID.");
    }
}