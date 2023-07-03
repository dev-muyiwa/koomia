import express, {Router} from "express";
import BlogController from "../controller/BlogController";
import {validateBearerToken, verifyAdminRole} from "../middlewares/auth";

const router: Router = express.Router();
const blogController: BlogController = new BlogController();

router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlog);


router.put("/dislikes", validateBearerToken, blogController.dislikeBlog);
router.put("/likes", validateBearerToken, blogController.likeBlog);

router.post("/new", validateBearerToken, verifyAdminRole, blogController.createBlog);
router.put("/:id", validateBearerToken, verifyAdminRole, blogController.updateBlog);

router.delete("/:id", validateBearerToken, verifyAdminRole, blogController.deleteBlog);

export default router;