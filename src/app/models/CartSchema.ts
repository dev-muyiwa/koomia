import mongoose, {Schema, Document, Model, Types} from "mongoose";


interface CartItem {
    product: Types.ObjectId,
    quantity: number
}

interface Cart extends Document {
    products: CartItem[];
    total_price: number;
    order_by: Types.ObjectId;
}

let cartSchema: Schema<Cart> = new Schema<Cart>({
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
cartSchema.pre<Cart>("save", async function (next) {
    const total_count = this.products.length;
    // this.total_price = this.products.map()
});


const Cart: Model<Cart> = mongoose.model<Cart>("Cart", cartSchema);

export default Cart;