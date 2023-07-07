import dotenv from "dotenv";
import express, {Application} from "express";
import {databaseConfig} from "./config/database";
import * as process from "process";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoute from "./app/routes/AuthRoute";
import {errorHandler, routeNotFound} from "./app/middlewares/errorHandler";
import productRoute from "./app/routes/ProductRoute";
import blogRoute from "./app/routes/BlogRoute";
import categoryRoute from "./app/routes/CategoryRoute";
import userRoute from "./app/routes/UserRoute";

dotenv.config();

const app: Application = express();

databaseConfig()


app.use(morgan("dev"))
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/blog", blogRoute);
app.use("/api/v1/category", categoryRoute);

app.use(routeNotFound);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Now running on port ${process.env.PORT}`);
});
