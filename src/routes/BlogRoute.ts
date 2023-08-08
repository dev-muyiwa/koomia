// import express, {Router} from "express";
// import {blogController} from "../controller/BlogController";
// import {validateBearerToken, verifyAdminRole} from "../middlewares/auth";
//
// const router: Router = express.Router();
//
//
//
//
// router.get("/", blogController.getAllBlogs);
// router.post("/new", validateBearerToken, verifyAdminRole, blogController.createBlog);
// router.get("/:id", blogController.getBlog);
// router.put("/:id", validateBearerToken, verifyAdminRole, blogController.updateBlog);
// router.delete("/:id", validateBearerToken, verifyAdminRole, blogController.deleteBlog);
//
// router.put("/:id/dislike", validateBearerToken, blogController.dislikeBlog);
// router.put("/:id/like", validateBearerToken, blogController.likeBlog);
//
// export default router;