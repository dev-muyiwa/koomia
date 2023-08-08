import express, {Application} from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "../routes/AuthRoutes";
import userRouter from "../routes/UserRoutes";
import adminRouter from "../routes/AdminRoutes";
import {apiErrorHandler, routeNotFound} from "../handlers/ErrorHandlers";
import categoryRouter from "../routes/CategoryRoutes";


const app: Application = express();

// Global middlewares.
app.use(morgan("dev"))
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


// Routes.
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoryRouter);
// app.use("/api/products", productRoute);
// app.use("/api/blogs", blogRoute);


// Error handling.
app.use(routeNotFound);
app.use(apiErrorHandler);

export default app;