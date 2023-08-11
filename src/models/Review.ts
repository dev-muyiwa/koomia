import mongoose, {Document, Model, Schema, Types} from "mongoose";


type ReviewDocument = Document & {
    product: Types.ObjectId,
    user: Types.ObjectId,
    rating: number,
    comment: string
}

const ReviewSchema: Schema<ReviewDocument> = new Schema<ReviewDocument>({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
}, {versionKey: false, timestamps: true});


const ReviewModel: Model<ReviewDocument> = mongoose.model("Review", ReviewSchema);

export {
    ReviewModel, ReviewDocument,
}