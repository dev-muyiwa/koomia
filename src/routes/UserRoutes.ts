import express, {Router} from "express";
import {checkAuthorizationToken, checkValidationErrors, checkVerificationStatus} from "../middlewares/auth";
import {addAvatar, getProfile, removeAvatar, updatePassword, updateProfile} from "../controller/UserController";
import {check} from "express-validator";
import {CustomError} from "../utils/CustomError";
import {uploads} from "../services/CloudinaryService";

const userRouter: Router = express.Router();

userRouter.use(checkAuthorizationToken, checkVerificationStatus);

userRouter.route("/me")
    .get(getProfile)
    .post(updateProfile)
    .put([
        check('oldPassword').notEmpty(),
        check('newPassword')
            .notEmpty()
            .isLength({min: 8})
            .withMessage('Password must be at least 8 characters.')
            .matches(/\d/)
            .withMessage("Password should have at least one digit.")
            .matches(/[!@#$%^&*(),.-?":{}|<>]/)
            .withMessage("Password should have at least one special character."),
        check('confirmPassword').custom((value, {req}) => {
            if (value !== req.body.newPassword) {
                throw new CustomError('Password confirmation does not match new password.');
            }

            return true;
        })
    ], checkValidationErrors, updatePassword);

userRouter.route("/me/avatar")
    .put(uploads.single("avatar"), addAvatar)
    .delete(removeAvatar);

export default userRouter;