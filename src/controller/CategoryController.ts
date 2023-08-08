// import {Request, Response} from "express";
// import {CustomError, errorHandler, responseHandler} from "../utils/responseResult";
// import {validateDbId} from "../utils/dbValidation";
// import Category, {CategoryType} from "../models/CategorySchema";
//

//
// const getAllCategories = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const categories: Category[] = await Category.find({category: req.body.category});
//
//         return responseHandler(res, categories, "All categories gotten.");
//     } catch (err) {
//         return errorHandler(res, err);
//     }
// }
//
// const getCategory = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const id: string = req.params.id;
//         validateDbId(id);
//         const category: Category | null = await Category.findById(id);
//         if (!category) {
//             throw new CustomError("Category not found.", CustomError.NOT_FOUND);
//         }
//         return responseHandler(res, category, `Category ${category.title} gotten.`);
//     } catch (err) {
//         return errorHandler(res, err);
//     }
// }

//
// export {
//     getAllCategories, getCategory
// }