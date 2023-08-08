import mongoose, {Model, Schema, Types} from "mongoose";
import {CategoryType} from "./enums/enum";


type CategoryDocument = Document & {
    name: string;
    subCategories: Types.ObjectId[]
    type: string,
}

const CategorySchema: Schema<CategoryDocument> = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    subCategories: [{
        type: Types.ObjectId,
        ref: "Category",
        required: false,
    }],
    type: {
        type: String,
        required: false,
        enum: CategoryType
    }
}, {versionKey: false});

const CategoryModel: Model<CategoryDocument> = mongoose.model("Category", CategorySchema);
export {
    CategoryModel, CategoryDocument
};