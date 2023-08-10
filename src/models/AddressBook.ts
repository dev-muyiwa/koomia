import mongoose, {Document, Model, Schema, Types} from "mongoose";

type AddressDocument = Document & {
    user: Types.ObjectId,
    firstName: string,
    lastName: string,
    primaryMobile: string,
    secondaryMobile?: string,
    address: string,
    moreInfo?: string,
    region: string,
    city: string,
    isDefaultAddress: boolean
}

const AddressSchema: Schema<AddressDocument> = new Schema<AddressDocument>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    primaryMobile: {
        type: String,
        required: true
    },
    secondaryMobile: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: true
    },
    moreInfo: {
        type: String,
        required: false
    },
    region: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    isDefaultAddress: {
        type: Boolean,
        default: false,
        required: true
    }
}, {versionKey: false});

const AddressModel: Model<AddressDocument> = mongoose.model("Address", AddressSchema);

export {
    AddressDocument, AddressModel
}