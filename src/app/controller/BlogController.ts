import {Request, Response} from "express";
import {sendError, sendResponse} from "../../utils/responseResult";
import Blog from "../models/BlogSchema";
import {validateDbId} from "../../utils/dbValidation";
import {AuthenticatedRequest} from "../middlewares/auth";
import {ObjectId} from "typeorm";

export default class BlogController {
    public async createBlog(req: Request, res: Response) {
        try {
            const blog: Blog = await Blog.create(req.body);

            return sendResponse(res, blog, `Blog ${blog.id} created.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }


    public async getBlog(req: Request, res: Response) {
        try {
            validateDbId(req.params.id)
            const blog: Blog | null = await Blog.findById(req.params.id)
                ?.populate("likes").populate("dislikes"); // Remove this to only show the user IDs.

            if (!blog) {
                throw new Error(`Blog ${req.params.id} not found.`);
            }
            blog.view_count += 1;
            await blog.save();

            return sendResponse(res, blog, `Blog ${blog.id} gotten.`, 200);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async getAllBlogs(req: Request, res: Response) {
        try {
            const blogs: Blog[] = await Blog.find();

            return sendResponse(res, blogs, `All blogs gotten.`, 200);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async updateBlog(req: Request, res: Response) {
        try {
            validateDbId(req.params.id)
            const blog: Blog | null = await Blog.findByIdAndUpdate(req.params.id, req.body, {new: true});

            if (!blog) {
                throw new Error(`Blog ${req.params.id} not found.`);
            }

            return sendResponse(res, blog, `Blog ${blog.id} updated.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async deleteBlog(req: Request, res: Response) {
        try {
            validateDbId(req.params.id)
            const blog: Blog | null = await Blog.findByIdAndDelete(req.params.id);

            if (!blog) {
                throw new Error(`Blog ${req.params.id} not found.`);
            }

            return sendResponse(res, blog, `Blog ${blog.id} deleted.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async likeBlog(req: AuthenticatedRequest, res: Response) {
        try {
            const blogId: string = req.body.blog_id;
            validateDbId(blogId);
            const blog: Blog | null = await Blog.findById(blogId);

            if (!blog) {
                throw new Error(`Blog ${blogId} not found.`);
            }
            const userId: string = req.user?.id;
            const isLiked: boolean = blog.is_liked;
            const alreadyDisliked: ObjectId | undefined = blog.dislikes.find(
                ((id: ObjectId): boolean => id.toString() === userId.toString())
            )
            if (alreadyDisliked) {
                await Blog.findByIdAndUpdate(blogId, {
                    $pull: {dislikes: userId},
                    is_disliked: false
                }, {new: true})
            }

            const updatedBlog: Blog | null = (isLiked) ?
                await Blog.findByIdAndUpdate(blogId, {
                    $pull: {likes: userId},
                    is_liked: false
                }, {new: true})
                :
                await Blog.findByIdAndUpdate(blogId, {
                    $push: {likes: userId},
                    is_liked: true
                }, {new: true});

            return sendResponse(res, updatedBlog, `Blog ${blog.id} liked by ${req.user?.first_name}.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }

    public async dislikeBlog(req: AuthenticatedRequest, res: Response) {
        try {
            const blogId: string = req.body.blog_id;
            validateDbId(blogId);
            const blog: Blog | null = await Blog.findById(blogId);

            if (!blog) {
                throw new Error(`Blog ${blogId} not found.`);
            }
            const userId: string = req.user?.id;
            const isDisliked: boolean = blog.is_disliked;
            const alreadyLiked: ObjectId | undefined = blog.likes.find(
                ((id: ObjectId): boolean => id.toString() === userId.toString())
            )
            if (alreadyLiked) {
                await Blog.findByIdAndUpdate(blogId, {
                    $pull: {likes: userId},
                    is_liked: false
                }, {new: true})
            }

            const updatedBlog: Blog | null = (isDisliked) ?
                await Blog.findByIdAndUpdate(blogId, {
                    $pull: {dislikes: userId},
                    is_disliked: false
                }, {new: true})
                :
                await Blog.findByIdAndUpdate(blogId, {
                    $push: {dislikes: userId},
                    is_disliked: true
                }, {new: true});

            return sendResponse(res, updatedBlog, `Blog ${blog.id} disliked by ${req.user?.first_name}.`, 201);
        } catch (err) {
            return sendError(res, err, err.message);
        }
    }


    // Blog Category.

}