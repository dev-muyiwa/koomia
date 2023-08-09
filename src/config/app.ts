import express, {Application} from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
const multer = require('multer');
const upload = multer();
import authRouter from "../routes/AuthRoutes";
import userRouter from "../routes/UserRoutes";
import adminRouter from "../routes/AdminRoutes";
import categoryRouter from "../routes/CategoryRoutes";
import productRouter from "../routes/ProductRoutes";
import {apiErrorHandler, routeNotFound} from "../handlers/ErrorHandlers";


const app: Application = express();

// Global middlewares.
app.use(morgan("dev"))
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

// app.use(upload.array());
// app.use(express.static('public'));


// Routes.
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
// app.use("/api/blogs", blogRoute);


// Error handling.
app.use(routeNotFound);
app.use(apiErrorHandler);

export default app;