import mongoose from "mongoose";
import * as process from "process";

export const databaseConfig = () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URL || "");
        console.log("Database connection successful.")
    } catch (err) {
        throw new Error(err);
    }
}