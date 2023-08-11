import mongoose, {Schema, Document, Model, Types} from "mongoose";
import {ProductDocument, ProductModel, ProductVariant} from "./Product";


type CartItem = Document & {
    product: Types.ObjectId,
    variant: Types.ObjectId,
    quantity: number
}

type CartDocument = Document & {
    user: Types.ObjectId,
    items: CartItem[],
    total: number,
}

let CartSchema: Schema<CartDocument> = new Schema<CartDocument>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    items: [{
        product: {
            type: Types.ObjectId,
            ref: "Product",
            required: true
        },
        variant: {
            type: Types.ObjectId,
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    total: Number,
}, {timestamps: true, versionKey: false});

CartSchema.post<CartDocument>(["save", "findOneAndUpdate"], async function (doc: CartDocument) {
    try {
        let totalPrice: number = 0;

        await doc.populate("items");

        for (const item of doc.items) {

            const product: ProductDocument | null = await ProductModel.findById(item.product);
            const variant: ProductVariant | undefined = product?.variants.find(v => v._id.equals(item.variant));

            if (variant && variant.stockQuantity >= item.quantity) {
                totalPrice += variant.price * item.quantity;
            }
        }

        if (totalPrice !== doc.total) {
            doc.total = totalPrice;
            await doc.save(); // Update the document with the calculated total
        }
    } catch (error) {
        console.error('Error calculating total price:', error);
    }
});

const CartModel: Model<CartDocument> = mongoose.model<CartDocument>("Cart", CartSchema);

export {
    CartModel, CartDocument, CartItem
}