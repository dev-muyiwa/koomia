import express, {Router} from "express";
import {
    checkAuthorizationToken,
    checkValidationErrors,
    checkVerificationStatus,
    verifyAdminRole
} from "../middlewares/auth";
import {
    addProductVariant, addToWishlist,
    createProduct,
    deleteProduct, deleteProductVariant,
    getProduct,
    getProducts, removeFromWishlist,
    updateProduct
} from "../controller/ProductController";
import {check} from "express-validator";
import {uploads} from "../services/CloudinaryService";


const productRouter: Router = express.Router();

productRouter.get("/", getProducts)
    .get("/:productId",
        check("productId")
            .isMongoId()
            .withMessage("Invalid product ID."),
        checkValidationErrors, getProduct);

//Authenticated routes.

productRouter.use(checkAuthorizationToken, checkVerificationStatus);

productRouter.route("/:productId/wishlists")
    .put(check("productId")
            .isMongoId()
            .withMessage("Invalid product ID."),
        checkValidationErrors, addToWishlist)
    .delete(check("productId")
            .isMongoId()
            .withMessage("Invalid product ID."),
        checkValidationErrors, removeFromWishlist);


// Admin routes.
productRouter.use(verifyAdminRole);

productRouter.post("/", verifyAdminRole, [
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
    .put(check("productId")
            .isMongoId()
            .withMessage("Invalid product ID."),
        checkValidationErrors, updateProduct)
    .delete(check("productId")
            .isMongoId()
            .withMessage("Invalid product ID."),
        checkValidationErrors, deleteProduct);

productRouter.post("/:productId/variants",
    check("productId")
        .isMongoId()
        .withMessage("Invalid product ID."),
    checkValidationErrors, addProductVariant);

productRouter.delete("/:productId/variants/:variantId",
    check("productId")
        .isMongoId()
        .withMessage("Invalid product ID."),
    check("variantId")
        .isMongoId()
        .withMessage("Invalid variant ID."),
    checkValidationErrors, deleteProductVariant);

export default productRouter;