import mongoose, {Schema, Document, Model} from "mongoose";

interface Cart extends Document {
    products: Schema.Types.ObjectId[];
    total_count: number;
    total_price: number;
    order_by: Schema.Types.ObjectId;
}

const cartSchema: Schema<Cart> = new Schema<Cart>({
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product"
    }],
    total_count: {
        type: Number,
        default: 0
    },
    total_price: {
        type: Number,
        default: 0
    },
    order_by: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, {timestamps: true, versionKey: false});


const Cart: Model<Cart> = mongoose.model<Cart>("Cart", cartSchema);

export default Cart;