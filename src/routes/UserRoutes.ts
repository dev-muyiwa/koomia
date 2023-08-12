import express, {Router} from "express";
import {checkAuthorizationToken, checkValidationErrors, checkVerificationStatus} from "../middlewares/auth";
import {
    addAddress,
    addAvatar, checkoutCart, deleteAddress,
    getProfile,
    getWishlists,
    removeAvatar, updateAddress,
    updatePassword,
    updateProfile, verifyCheckout
} from "../controller/UserController";
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

userRouter.get("/me/wishlists", getWishlists);

userRouter.post("/me/addresses", [
    check("firstName").escape().notEmpty().isLength({max: 15}).withMessage("First name cannot be more than 15 characters."),
    check("lastName").escape().notEmpty().isLength({max: 15}).withMessage("Last name cannot be more than 15 characters."),
    check("primaryMobile").escape().isMobilePhone("any").withMessage("Invalid mobile."),
    check('address').escape().notEmpty().withMessage("Address cannot be empty."),
    check("region").escape().notEmpty().withMessage("Region cannot be empty."),
    check("city").escape().notEmpty().withMessage("City cannot be empty.")
], checkValidationErrors, addAddress);

userRouter.route("/me/addresses/:addressId")
    .put(check("addressId")
            .isMongoId()
            .withMessage("Invalid address ID."),
        check("firstName").escape().notEmpty().isLength({max: 15}).withMessage("First name cannot be more than 15 characters."),
        check("lastName").escape().notEmpty().isLength({max: 15}).withMessage("Last name cannot be more than 15 characters."),
        check("primaryMobile").escape().isMobilePhone("any").withMessage("Invalid mobile."),
        check('address').escape().notEmpty().withMessage("Address cannot be empty."),
        check("region").escape().notEmpty().withMessage("Region cannot be empty."),
        check("city").escape().notEmpty().withMessage("City cannot be empty."),
        checkValidationErrors, updateAddress)
    .delete(check("addressId")
            .isMongoId()
            .withMessage("Invalid address ID."),
        checkValidationErrors, deleteAddress);

userRouter.post("/me/checkout", check("addressId")
    .isMongoId()
    .withMessage("Invalid address ID."), checkValidationErrors, checkoutCart)

userRouter.get("/me/verify-checkout/:orderId",check("orderId")
        .isMongoId()
        .withMessage("Invalid address ID."),
    checkValidationErrors, verifyCheckout);
export default userRouter;