import mongoose, {Document, Model, Schema, Types} from "mongoose";


type ProductVariant = {
    color: string;
    size?: string;
    price: number;
}

type ImageResponse = Document & {
    url: string,
    publicId: string
}

type ProductDocument = Document & {
    name: string;
    description: string;
    brand: string;
    category: Types.ObjectId;
    stockQuantity: number;
    images: ImageResponse[];
    variants: ProductVariant[],
    isNewArrival: boolean
}

const ProductSchema: Schema<ProductDocument> = new Schema<ProductDocument>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true,
        lowercase: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    stockQuantity: {
        type: Number,
        required: true
    },
    images: [{
        url: String,
        publicId: String
    }],
    variants: [{
        color: {
            type: String,
            required: true
        },
        size: String,
        price: {
            type: Number,
            required: true
        }
    }],
    isNewArrival: {
        type: Boolean,
        default: true
    }
}, {timestamps: true, versionKey: false});


const ProductModel: Model<ProductDocument> = mongoose.model("Product", ProductSchema);

export {
    ProductModel, ProductDocument
}