import mongoose, {Document, Model, Schema, Types} from "mongoose";


type ProductVariant = {
    color?: string;
    size?: string;
    stockQuantity: number;
    price: number;
}

type ImageResponse = Document & {
    url: string,
    publicId: string
}

type ProductDocument = Document & {
    name: string;
    description: string;
    brand: Types.ObjectId;
    category: Types.ObjectId;
    images: ImageResponse[];
    variants: ProductVariant[],
    isNewArrival?: boolean

    getBasicInfo(): object;
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
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    images: [{
        url: String,
        publicId: String
    }],
    variants: [{
        color: String,
        size: String,
        stockQuantity: {
            type: Number,
            required: true
        },
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

ProductModel.prototype.getBasicInfo = function () {
    const {id, name, images, variants} = this as ProductDocument;

    return {id: id, name: name, image: images[0], price: variants[0].price};
}

export {
    ProductModel, ProductDocument, ImageResponse
}