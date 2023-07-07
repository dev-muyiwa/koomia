import {Request, Response} from "express";
import {CustomError, handleResponseErrors, sendResponse} from "../../utils/responseResult";
import Blog from "../models/BlogSchema";
import {validateDbId} from "../../utils/dbValidation";
import {AuthenticatedRequest} from "../middlewares/auth";
import {ObjectId} from "typeorm";

const createBlog = async (req: Request, res: Response): Promise<Response> => {
    try {
        const blog: Blog = await Blog.create(req.body);

        return sendResponse(res, blog, `Blog ${blog.id} created.`, 201);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const getBlog = async (req: Request, res: Response): Promise<Response> => {
    try {
        validateDbId(req.params.id)
        const blog: Blog | null = await Blog.findById(req.params.id)
            ?.populate("likes").populate("dislikes"); // Remove this to only show the user IDs.

        if (!blog) {
            throw new CustomError(`Blog ${req.params.id} not found.`, CustomError.NOT_FOUND);
        }
        blog.view_count += 1;
        await blog.save();

        return sendResponse(res, blog, `Blog ${blog.id} gotten.`, 200);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const getAllBlogs = async (req: Request, res: Response): Promise<Response> => {
    try {
        const blogs: Blog[] = await Blog.find();

        return sendResponse(res, blogs, `All blogs gotten.`, 200);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const updateBlog = async (req: Request, res: Response): Promise<Response> => {
    try {
        validateDbId(req.params.id)
        const blog: Blog | null = await Blog.findByIdAndUpdate(req.params.id, req.body, {new: true});

        if (!blog) {
            throw new CustomError(`Blog ${req.params.id} not found.`, CustomError.NOT_FOUND);
        }

        return sendResponse(res, blog, `Blog ${blog.id} updated.`, 201);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const deleteBlog = async (req: Request, res: Response): Promise<Response> => {
    try {
        validateDbId(req.params.id)
        const blog: Blog | null = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            throw new CustomError(`Blog ${req.params.id} not found.`, CustomError.NOT_FOUND);
        }

        return sendResponse(res, blog, `Blog ${blog.id} deleted.`, 201);
    } catch (err) {
        return handleResponseErrors(res, err);
    }
}

const likeBlog = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const blogId: string = req.body.blog_id;
        validateDbId(blogId);
        const blog: Blog | null = await Blog.findById(blogId);

        if (!blog) {
            throw new CustomError(`Blog ${blogId} not found.`, CustomError.NOT_FOUND);
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
        return handleResponseErrors(res, err);
    }
}

const dislikeBlog = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const blogId: string = req.body.blog_id;
        validateDbId(blogId);
        const blog: Blog | null = await Blog.findById(blogId);

        if (!blog) {
            throw new CustomError(`Blog ${blogId} not found.`, CustomError.NOT_FOUND);
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
        return handleResponseErrors(res, err);
    }
}

export const blogController = {
    createBlog, getBlog, getAllBlogs, updateBlog, deleteBlog, likeBlog, dislikeBlog
}

