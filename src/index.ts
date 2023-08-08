import {config} from "./config/config";
import {databaseSetup} from "./config/database";
import app from "./config/app";
import {v2 as cloudinary} from "cloudinary";
import process from "process";

const port: number = config.server.port;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
});

databaseSetup().then(() => {
    console.log("Database connection successful.");

    app.listen(port, async () => {
        console.log(`Listening on port ${port}...`);
    });
}).catch(err => {
    console.error("Error connecting to the database...", err);
});