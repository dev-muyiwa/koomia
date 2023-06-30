import {Document, Types} from "mongoose";


export interface Rating {
    star: number;
    posted_by: Types.ObjectId;
}

export interface Product extends Document {
    title: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    quantity?: number;
    sold: number;
    images: string[];
    color: string;
    ratings: Rating[];
}