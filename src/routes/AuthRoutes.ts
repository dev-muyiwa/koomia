import express, {Router} from "express";
import {check} from "express-validator";
import {checkAuthorizationToken, checkValidationErrors, checkVerificationStatus} from "../middlewares/auth";
import {
    forgotPassword, handleRefreshToken,
    login, logout,
    resetPassword,
    signup,
    startAccountVerification,
    verifyAccount
} from "../controller/AuthController";
import {CustomError} from "../utils/CustomError";


const authRouter: Router = express.Router();

authRouter.post("/signup", [
    check("firstName").escape().notEmpty().isLength({max: 15}).withMessage("First name cannot be more than 15 characters."),
    check("lastName").escape().notEmpty().isLength({max: 15}).withMessage("Last name cannot be more than 15 characters."),
    check("email").escape().isEmail().withMessage("Invalid email."),
    check("mobile").escape().isMobilePhone("any").withMessage("Invalid mobile."),
    check('password')
        .notEmpty()
        .isLength({min: 8})
        .withMessage('password must be at least 8 characters')
        .matches(/\d/)
        .withMessage('password should have at least one number')
        .matches(/[!@#$%^&*(),.-?":{}|<>]/)
        .withMessage('password should have at least one special character'),
], checkValidationErrors, signup);

authRouter.post("/login", [
    check("username").escape().trim().notEmpty(),
    check("password").escape().notEmpty(),
], checkValidationErrors, login);

authRouter.route("/verify-email")
    .get(checkAuthorizationToken, startAccountVerification)
    .post(checkAuthorizationToken, verifyAccount)

authRouter.post("/forgot-password", [
    check("email").escape().isEmail().withMessage("Invalid email."),
], checkValidationErrors, forgotPassword);

authRouter.put("/reset-password/:token", [
    check('password')
        .notEmpty()
        .isLength({min: 8})
        .withMessage('password must be at least 8 characters')
        .matches(/\d/)
        .withMessage('password should have at least one number')
        .matches(/[!@#$%^&*(),.-?":{}|<>]/)
        .withMessage('password should have at least one special character'),
    check('confirmPassword').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new CustomError('Password confirmation does not match password.', CustomError.BAD_REQUEST);
        }
        return true;
    })], checkValidationErrors, resetPassword);

authRouter.get("/refresh-token", handleRefreshToken);
authRouter.post("/logout", checkAuthorizationToken, logout);

export default authRouter;
