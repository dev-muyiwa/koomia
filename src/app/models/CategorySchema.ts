import mongoose, {Model, Schema} from "mongoose";

export enum CategoryType {
    PRODUCT = "product",
    BLOG = "blog",
    BRAND = "brand"
}

interface Category extends Document {
    title: string;
    category: CategoryType,
}

const categorySchema: Schema<Category> = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    }
}, {timestamps: true, versionKey: false});

const Category: Model<Category> = mongoose.model("Category", categorySchema);
export default Category;