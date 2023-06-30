import express, {Router} from "express";
import {ProductController} from "../controller/ProductController";
import {validateBearerToken, verifyAdminRole} from "../middlewares/auth";

const router: Router = express.Router();
const productController: ProductController = new ProductController();

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getSingleProduct);
// Admin routes.
router.post("/", validateBearerToken, verifyAdminRole, productController.createProduct);
router.put("/:id", validateBearerToken, verifyAdminRole, productController.updateProduct);
router.delete("/:id", validateBearerToken, verifyAdminRole, productController.deleteProduct);

export default router;