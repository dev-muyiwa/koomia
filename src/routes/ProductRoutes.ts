import express, {Router} from "express";
import {
    checkAuthorizationToken,
    checkValidationErrors,
    checkVerificationStatus,
    verifyAdminRole
} from "../middlewares/auth";
import {
    addProductVariant, upsertToCart, addToWishlist,
    createProduct,
    deleteProduct, deleteProductVariant,
    getProduct,
    getProducts, removeFromCart, removeFromWishlist,
    updateProduct
} from "../controller/ProductController";
import {check} from "express-validator";
import {uploads} from "../services/CloudinaryService";



const productRouter: Router = express.Router();

// Middleware Routes.

productRouter.use("/:productId", [
        check("productId")
            .isMongoId()
            .withMessage("Invalid product ID.")],
    checkValidationErrors);

productRouter.use("/:productId/cart/:variantId", [
        check("variantId")
            .isMongoId()
            .withMessage("Invalid variant ID."),],
    checkValidationErrors);

productRouter.get("/", getProducts)
    .get("/:productId", getProduct);



//Authenticated routes.

productRouter.use(checkAuthorizationToken, checkVerificationStatus);

productRouter.route("/:productId/wishlists")
    .put(addToWishlist)
    .delete(removeFromWishlist);


productRouter.route("/:productId/cart/:variantId")
    .post([check("quantity")
            .isInt({min: 1})
            .withMessage("Quantity is of type integer with a minimum of 1.")],
        checkValidationErrors, upsertToCart)
    .delete(removeFromCart);


// Admin routes.
productRouter.use(verifyAdminRole);

productRouter.post("/", verifyAdminRole, [
    uploads.array("images"),
    check('name').trim().notEmpty().withMessage("Product name cannot be empty."),
    check('description').trim().notEmpty().withMessage("Product description cannot be empty."),
    check('brandId').trim().notEmpty().isMongoId().withMessage("Invalid brand ID."),
    check('variants').isJSON().custom((value) => {
        const variants = JSON.parse(value);

        if (!Array.isArray(variants)) {
            throw new Error('Variants must be an array.');
        }

        variants.forEach((variant) => {
            const {color, size ,stockQuantity, price} = variant;
            if (!price || !stockQuantity || typeof price !== 'number' || typeof stockQuantity !== 'number') {
                throw new Error('Invalid variant data.');
            }
        });

        return true;
    }),
    check('categoryId').trim().notEmpty().isMongoId().withMessage("Invalid category ID.")
], checkValidationErrors, createProduct);

productRouter.route("/:productId")
    .put(updateProduct)
    .delete(deleteProduct);

productRouter.post("/:productId/variants", addProductVariant);

productRouter.delete("/:productId/variants/:variantId", deleteProductVariant);

export default productRouter;