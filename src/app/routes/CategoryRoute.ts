import express, {Router} from "express";
import {CategoryController} from "../controller/CategoryController";
import {validateBearerToken, verifyAdminRole} from "../middlewares/auth";

const router: Router = express.Router();
const categoryController: CategoryController = new CategoryController();

router.get("/all", validateBearerToken, categoryController.getAllCategories);
router.get("/:id", validateBearerToken, categoryController.getCategory);

router.post("/new", validateBearerToken, verifyAdminRole, categoryController.createCategory);
router.put("/:id", validateBearerToken, verifyAdminRole, categoryController.updateCategory);
router.delete("/:id", validateBearerToken, verifyAdminRole, categoryController.deleteCategory);


export default router;
