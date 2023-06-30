import mongoose, {Types} from "mongoose";

export const validateDbId = (id: string) => {
    const isValid: boolean = Types.ObjectId.isValid(id);
    if (!isValid){
        throw new Error("Invalid Id.");
    }
}