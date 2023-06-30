import mongoose, {Model, Schema} from "mongoose";
import {Product} from "../interface/Product";

const productSchema: Schema<Product> = new Schema({
    title: {
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
        required: true
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
    images: {
        type: [String]
    },
    color: {
        type: String,
        required: true
    },
    ratings: [{
        star: Number,
        posted_by: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }]
}, {timestamps: true, versionKey: false});

const Product: Model<Product> = mongoose.model("Product", productSchema);
export default Product;