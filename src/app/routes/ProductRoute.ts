import express, {Router} from "express";
import {ProductController} from "../controller/ProductController";
import {uploads, validateBearerToken, verifyAdminRole} from "../middlewares/auth";

const router: Router = express.Router();
const productController: ProductController = new ProductController();

router.get("/", productController.getAllProducts);
router.post("/",
    validateBearerToken, verifyAdminRole, uploads.array("images"), productController.createProduct);

router.use(validateBearerToken)
    .get("/:id", productController.getSingleProduct)
    .put("/:id", verifyAdminRole, productController.updateProduct)
    .delete("/:id", verifyAdminRole, productController.deleteProduct)
    .put("/:id/wishlist", validateBearerToken, productController.addToWishlist)
    .get("/:id/reviews", validateBearerToken, productController.getAllReviews)
    .post("/:id/reviews/new", validateBearerToken, productController.addReview);


export default router;