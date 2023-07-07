import express, {Router} from "express";
import {authController} from "../controller/AuthController";
import {validateBearerToken} from "../middlewares/auth";

const router: Router = express.Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/forgot-password", authController.forgotPassword);
router.put("/reset-password/:token", authController.resetPassword);
router.get("/refresh", validateBearerToken, authController.handleRefreshToken);
router.post("/logout", validateBearerToken, authController.logoutUser);

export default router;
