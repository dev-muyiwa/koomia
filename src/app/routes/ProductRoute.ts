import express, {Router} from "express";
import {productController} from "../controller/ProductController";
import {uploads, validateBearerToken, verifyAdminRole} from "../middlewares/auth";





const router: Router = express.Router();

router.post("/new",
    validateBearerToken, verifyAdminRole, uploads.array("images"), productController.createProduct);

router.get("/all", productController.getAllProducts)
    .get("/:id", productController.getSingleProduct)
    .get("/:id/reviews",  productController.getAllReviews)
    .use(validateBearerToken)
    .post("/:id", verifyAdminRole, productController.updateProduct)
    .delete("/:id", verifyAdminRole, productController.deleteProduct)
    .post("/:id/wishlist/new", productController.addOrDeleteFromWishlist)
    .post("/:id/cart/new", productController.addOrRemoveFromCart)
    .post("/:id/reviews/new", productController.addReview);

export default router;