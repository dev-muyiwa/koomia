import {userSeeders} from "../app/seeders/userSeeder";
import {productSeeders} from "../app/seeders/productSeeder";
import mongoose from "mongoose";
import process from "process";
import dotenv from "dotenv";

dotenv.config()
const seed = async () => {
    try {
        const userSeedData: Object[] = userSeeders(4);
        const productSeedData: Object[] = productSeeders(1);
        await mongoose.connect(process.env.MONGODB_URL || "", {
            bufferCommands: false,
            serverSelectionTimeoutMS: 30000
        });

        await mongoose.connection.collection("users").insertMany(userSeedData);
        // await mongoose.connection.collection("products").insertMany(productSeedData);

        console.log('Data insertion completed successfully.');
    } catch (error) {
        console.error('Error inserting data:', error);
    }
};

seed();
