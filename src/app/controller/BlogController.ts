import {Request, Response} from "express";
import {sendError, sendResponse} from "../../utils/responseResult";
import Blog from "../models/schema/BlogSchema";
import {validateDbId} from "../../utils/dbValidation";
import {AuthenticatedRequest} from "../middlewares/auth";

export default class BlogController {
    public async createBlog(req: Request, res: Response) {
        try{
            const blog: Blog = await Blog.create(req.body);

            return sendResponse(res, blog, `Blog ${blog.id} created.`, 201);
        } catch(err) {
            return sendError(res, err, err.message);
        }
    }


    public async getBlog(req: Request, res: Response) {
        try{
            validateDbId(req.params.id)
            const blog: Blog|null = await Blog.findById(req.params.id);

            if (!blog){
                throw new Error(`Blog ${req.params.id} not found.`);
            }
            blog.view_count += 1;
            await blog.save();

            return sendResponse(res, blog, `Blog ${blog.id} gotten.`, 200);
        } catch(err) {
            return sendError(res, err, err.message);
        }
    }

    public async getAllBlogs(req: Request, res: Response) {
        try{
            const blogs: Blog[] = await Blog.find();

            return sendResponse(res, blogs, `All blogs gotten.`, 200);
        } catch(err) {
            return sendError(res, err, err.message);
        }
    }
    public async updateBlog(req: Request, res: Response) {
        try{
            validateDbId(req.params.id)
            const blog: Blog|null = await Blog.findByIdAndUpdate(req.params.id, req.body, {new: true});

            if (!blog){
                throw new Error(`Blog ${req.params.id} not found.`);
            }

            return sendResponse(res, blog, `Blog ${blog.id} updated.`, 201);
        } catch(err) {
            return sendError(res, err, err.message);
        }
    }

    public async deleteBlog(req: Request, res: Response) {
        try{
            validateDbId(req.params.id)
            const blog: Blog|null = await Blog.findByIdAndDelete(req.params.id);

            if (!blog){
                throw new Error(`Blog ${req.params.id} not found.`);
            }

            return sendResponse(res, blog, `Blog ${blog.id} deleted.`, 201);
        } catch(err) {
            return sendError(res, err, err.message);
        }
    }

    public async likeBlog(req: AuthenticatedRequest, res: Response) {
        try{
            const id: string = req.body.blog_id;
            console.log(id);
            validateDbId(id);
            const blog: Blog|null = await Blog.findById(id);

            if (!blog){
                throw new Error(`Blog ${id} not found.`);
            }
            const userId: string = req.user?.id;
            const isLiked: boolean = blog.is_liked;
            // const alreadyDisliked = blog.dislikes.find(
                // (userId = userId.toString() === lo)
            // )

            return sendResponse(res, blog, `Blog ${blog.id} deleted.`, 201);
        } catch(err) {
            return sendError(res, err, err.message);
        }
    }
}