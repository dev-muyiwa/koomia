import express, {Router} from "express";
import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategory,
    updateCategory
} from "../controller/CategoryController";
import {check} from "express-validator";
import {CategoryType} from "../models/enums/enum";
import {checkAuthorizationToken, checkValidationErrors, verifyAdminRole} from "../middlewares/auth";
import adminRouter from "./AdminRoutes";

const categoryRouter: Router = express.Router();


categoryRouter.route("/")
    .get(getCategories)
    .post( checkAuthorizationToken, verifyAdminRole, [
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


categoryRouter.route("/:categoryId")
    .get(getCategory)
    .put(checkAuthorizationToken, verifyAdminRole, [
        check("name")
            .trim()
            .notEmpty()
            .withMessage("Name cannot be empty.")
    ], checkValidationErrors, updateCategory)
    .delete(checkAuthorizationToken, verifyAdminRole, deleteCategory);


export default categoryRouter;
