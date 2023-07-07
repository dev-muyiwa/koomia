import mongoose, {Model, Schema, Types, Document} from "mongoose";

interface Wishlist extends Document {
    user: Types.ObjectId,
    products: Types.ObjectId[]
}
const wishlistSchema: Schema<Wishlist> = new Schema<Wishlist>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product",
        default: []
    }]
}, {versionKey: false, timestamps: true});

const Wishlist: Model<Wishlist> = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;