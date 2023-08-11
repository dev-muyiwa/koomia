import mongoose, {Model, Schema, Types, Document} from "mongoose";

type WishlistDocument = Document & {
    _id: Types.ObjectId,
    products: Types.ObjectId[]
}
const WishlistSchema: Schema<WishlistDocument> = new Schema<WishlistDocument>({
    _id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product",
        default: []
    }]
}, {versionKey: false, timestamps: true, _id: false});

const WishlistModel: Model<WishlistDocument> = mongoose.model("Wishlist", WishlistSchema);

export {
    WishlistModel, WishlistDocument
};