import mongoose, {Model, Schema, Types} from "mongoose";
import {OrderStatus} from "./enums/enum";
import {CartItem} from "./Cart";


type OrderDocument = Document & {
    user: Types.ObjectId,
    status: OrderStatus,
    address: Types.ObjectId,
    items: CartItem[]
}

const OrderSchema: Schema<OrderDocument> = new Schema<OrderDocument>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PENDING
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: "Address",
        required: true
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
    }]
}, {versionKey: false});

const OrderModel: Model<OrderDocument> = mongoose.model("Order", OrderSchema);

export {
    OrderModel, OrderDocument
}