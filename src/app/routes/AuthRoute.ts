import express, {Router} from "express";
import {check} from "express-validator";
import {authController} from "../controller/AuthController";
import {validateBearerToken} from "../middlewares/auth";








const router: Router = express.Router();

router.post("/register", [
    check("first_name").escape().isLength({max: 15}).withMessage("First name cannot be more than 15 characters."),
    check("last_name").escape().isLength({max: 15}).withMessage("Last name cannot be more than 15 characters."),
    check("email").escape().isEmail().withMessage("Invalid email."),
    check("password").escape().isLength({min: 8}).withMessage("Password must be at least 8 characters long."),
], authController.registerUser);

router.post("/login", [
    check("password").escape().isLength({min: 8}).withMessage("Password must be at least 8 characters long."),
], authController.loginUser);

router.post("/forgot-password", [
    check("email").escape().isEmail().withMessage("Invalid email."),
], authController.forgotPassword);

router.put("/reset-password/:token", [
    check("password").escape().isLength({min: 8}).withMessage("Password must be at least 8 characters long."),
], authController.resetPassword);

router.get("/refresh", validateBearerToken, authController.handleRefreshToken);
router.post("/logout", validateBearerToken, authController.logoutUser);

export default router;
