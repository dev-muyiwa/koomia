// import mongoose, {Document, Model, Schema, Types} from "mongoose";
// import {Role} from "./User";
//
// interface Blog extends Document {
//     title: string,
//     description: string,
//     category: string,
//     view_count: number,
//     is_liked: boolean,
//     is_disliked: boolean,
//     likes: [Types.ObjectId],
//     dislikes: [Types.ObjectId],
//     image: string,
//     author: string
// }
//
// let blogSchema: Schema<Blog> = new Schema({
//     title: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: String,
//         required: true
//     },
//     view_count: {
//         type: Number,
//         default: 0
//     },
//     is_liked: {
//         type: Boolean,
//         default: false
//     },
//     is_disliked: {
//         type: Boolean,
//         default: false
//     },
//     likes: [{
//         type: Types.ObjectId,
//         ref: "User"
//     }],
//     dislikes: [{
//         type: Types.ObjectId,
//         ref: "User"
//     }],
//     image: {
//         type: String,
//         default: ""
//     },
//     author: {
//         type: String,
//         default: Role.ADMIN
//     }
// }, {
//     versionKey: false,
//     timestamps: true,
//     toJSON: {
//         virtuals: true
//     },
//     toObject: {
//         virtuals: true
//     }
// });
//
// const Blog: Model<Blog> = mongoose.model("Blog", blogSchema);
//
// export default Blog;