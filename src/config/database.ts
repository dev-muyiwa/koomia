import mongoose from "mongoose";
import {config} from "./config";

export const databaseSetup = async () => {
    try {
        await mongoose.connect(config.mongo.url, {maxPoolSize: 5});
    } catch (err) {
        throw new Error(err);
    }
}