import {Schema, Types} from "mongoose";
import Cart from "./CartSchema";


export enum OrderStatus {
    UNPROCESSED = "not processed",
    PROCESSING = "processing",
    DISPATCHED = "dispatched",
    CANCELLED = "cancelled",
    DELIVERED = "delivered"
}

export enum PaymentType {
    CARD,
    ON_DELIVERY,
    STORE_CREDIT
}


export interface Order extends Document {
    products: Cart,
    shippingAddress: Schema.Types.ObjectId,
    status: OrderStatus,
    ordered_by: Schema.Types.ObjectId,
    payment_method: PaymentType
}

const orderSchema: Schema<Order> = new Schema<Order>({
    products: [{
        product: {
            type: Types.ObjectId,
            ref: "Product"
        },
        quantity: Number
    }],
    shippingAddress: {
        type: Schema.Types.ObjectId,
        ref: "Address"
    },
    status: {
        type: String,
        enum: OrderStatus,
        default: OrderStatus.UNPROCESSED
    },
    payment_method: {
        type: Number,
        enum: PaymentType
    },
    ordered_by: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, {timestamps: true, versionKey: false});