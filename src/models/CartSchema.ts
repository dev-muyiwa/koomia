import mongoose, {Schema, Document, Model, Types} from "mongoose";


export interface CartItem {
    product: Types.ObjectId,
    quantity: number
}

type CartDocument = Document & {
    products: CartItem[];
    total_price: number;
    order_by: Types.ObjectId;
}

let CartSchema: Schema<CartDocument> = new Schema<CartDocument>({
    products: [{
        product: {
            type: Types.ObjectId,
            ref: "Product"
        },
        quantity: Number
    }],
    total_price: Number,
    order_by: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, {timestamps: true, versionKey: false});

// Create a hook that checks if the amount is 0 and removes that product form the database.
// Create a hook that calculates the total price of items.
CartSchema.pre<CartDocument>("save", async function (next) {
    const total_count = this.products.length;
    // this.total_price = this.products.map()
});


const CartModel: Model<CartDocument> = mongoose.model<CartDocument>("Cart", CartSchema);

export default CartModel;