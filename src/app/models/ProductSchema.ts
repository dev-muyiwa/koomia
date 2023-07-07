import mongoose, {Document, Model, Schema, Types} from "mongoose";
import {ImageResponse} from "../../services/fileUploadService";


interface Product extends Document {
    name: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    quantity?: number;
    sold: number;
    images: ImageResponse[];
    color: string;
}

let productSchema: Schema<Product> = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true,
        lowercase: true
    },
    quantity: {
        type: Number,
        required: true
    },
    sold: {
        type: Number,
        default: 0,
        // select: false
    },
    images: [{
        public_id: String,
        secure_url: String
    }],
    color: {
        type: String,
        required: true
    },
}, {timestamps: true, versionKey: false});


const Product: Model<Product> = mongoose.model("Product", productSchema);
export default Product;