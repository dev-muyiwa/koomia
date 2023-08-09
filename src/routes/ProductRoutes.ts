import express, {Router} from "express";
import {
    checkAuthorizationToken,
    checkValidationErrors,
    checkVerificationStatus,
    verifyAdminRole
} from "../middlewares/auth";
import {createProduct, getProduct, getProducts} from "../controller/ProductController";
import {check} from "express-validator";
import {uploads} from "../services/CloudinaryService";


const productRouter: Router = express.Router();

productRouter.route("/")
    .get(getProducts)
    .post(checkAuthorizationToken, checkVerificationStatus, verifyAdminRole, [
        uploads.array("images"),
        check('name').trim().notEmpty().withMessage("Product name cannot be empty."),
        check('description').trim().notEmpty().withMessage("Product description cannot be empty."),
        check('brandId').trim().notEmpty().isMongoId().withMessage("Invalid brand ID."),
        check('variants').isJSON().custom((value, {req}) => {
            const variants = JSON.parse(value);

            if (!Array.isArray(variants)) {
                throw new Error('Variants must be an array.');
            }

            variants.forEach((variant) => {
                const {color, size, stockQuantity, price} = variant;
                if (!price || !stockQuantity || typeof price !== 'number' || typeof stockQuantity !== 'number') {
                    throw new Error('Invalid variant data.');
                }
            });

            return true;
        }),
        check('categoryId').trim().notEmpty().isMongoId().withMessage("Invalid category ID.")
    ], checkValidationErrors, createProduct);


productRouter.route("/:productId")
    .get(getProduct)

export default productRouter;