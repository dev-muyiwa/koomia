import express, {Router} from "express";
import BlogController from "../controller/BlogController";
import {validateDbId} from "../../utils/dbValidation";
import {validateBearerToken, verifyAdminRole} from "../middlewares/auth";

const router: Router = express.Router();
const blogController: BlogController = new BlogController();

router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlog);
router.post("/new", validateBearerToken, verifyAdminRole, blogController.createBlog);
router.put("/:id", validateBearerToken, verifyAdminRole, blogController.updateBlog);
router.delete("/:id", validateBearerToken, verifyAdminRole, blogController.deleteBlog);

router.put("/likes", validateBearerToken, blogController.likeBlog);

export default router;