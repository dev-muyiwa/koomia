// import express, {Router} from "express";
// import {categoryController} from "../controller/CategoryController";
// import {validateBearerToken, verifyAdminRole} from "../middlewares/auth";
//
// const router: Router = express.Router();
//
// router.get("/all", validateBearerToken, categoryController.getAllCategories);
// router.post("/new", validateBearerToken, verifyAdminRole, categoryController.createCategory);
// router.get("/:id", validateBearerToken, categoryController.getCategory);
// router.put("/:id", validateBearerToken, verifyAdminRole, categoryController.updateCategory);
// router.delete("/:id", validateBearerToken, verifyAdminRole, categoryController.deleteCategory);
//
// export default router;
