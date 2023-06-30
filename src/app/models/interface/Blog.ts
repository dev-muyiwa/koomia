import {Document, Types} from "mongoose";





export interface Blog extends Document {
    title: string,
    description: string,
    category: string,
    view_count: number,
    is_liked: boolean,
    is_disliked: boolean,
    likes: [Types.ObjectId],
    dislikes: [Types.ObjectId],
    image: string,
    author: string
}