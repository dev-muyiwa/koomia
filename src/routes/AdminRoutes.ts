import express, {Router} from "express";
import {checkAuthorizationToken, checkValidationErrors, verifyAdminRole} from "../middlewares/auth";
import {
    blockUser,
    createCategory,
    deleteCategory, getCategory,
    getUser,
    getUsers,
    unblockUser,
    updateCategory
} from "../controller/AdminController";
import {check} from "express-validator";
import {CategoryType} from "../models/enums/enum";


const adminRouter: Router = express.Router();

adminRouter.use(checkAuthorizationToken, verifyAdminRole);

adminRouter.get("/users", getUsers);

adminRouter.route("/users/:userId")
    .get(getUser)
    .put(blockUser)
    .patch(unblockUser);

adminRouter.post("/categories", [
    check("name")
        .trim()
        .notEmpty()
        .withMessage("Category name cannot be empty."),
    check("type")
        .trim()
        .toLowerCase()
        .isIn(Object.values(CategoryType))
        .withMessage(`Type must be in ${Object.values(CategoryType)}.`)
], checkValidationErrors, createCategory);


adminRouter.route("/categories/:categoryId")
    .put([
        check("name")
            .trim()
            .notEmpty()
            .withMessage("Name cannot be empty.")
    ], checkValidationErrors, updateCategory)
    .delete(deleteCategory);
export default adminRouter;