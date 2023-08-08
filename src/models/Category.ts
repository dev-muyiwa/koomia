import mongoose, {Model, Document, Schema, Types} from "mongoose";
import {CategoryType} from "./enums/enum";


type CategoryDocument = Document & {
    name: string;
    subCategories: Types.ObjectId[]
    type: string,
}

let CategorySchema: Schema<CategoryDocument> = new Schema({
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

CategorySchema.pre('findOneAndDelete', async function () {
    const categoryId = this.getQuery()['_id'];

    const parentCategories: CategoryDocument[] = await mongoose.model<CategoryDocument>('Category')
        .find({subCategories: categoryId});

    await Promise.all(parentCategories.map(async (parentCategory) => {
        parentCategory.subCategories = parentCategory.subCategories.filter(
            (subcategoryId) => !subcategoryId.equals(categoryId)
        );
        await parentCategory.save();
    }));
});


const CategoryModel: Model<CategoryDocument> = mongoose.model("Category", CategorySchema);
export {
    CategoryModel, CategoryDocument
};