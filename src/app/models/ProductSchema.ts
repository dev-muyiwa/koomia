import mongoose, {Document, Model, Schema, Types} from "mongoose";

export interface Rating {
    star: number;
    review: string,
    posted_by: Types.ObjectId;
}

interface Product extends Document {
    title: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    quantity?: number;
    sold: number;
    images: string[];
    color: string;
    ratings: Rating[];
    average_rating: number;
    calculateAverageRating(): number
}

let productSchema: Schema<Product> = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    sold: {
        type: Number,
        default: 0,
        // select: false
    },
    images: {
        type: [String]
    },
    color: {
        type: String,
        required: true
    },
    ratings: [{
        star: Number,
        review: String,
        posted_by: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }],
    average_rating: {
        type: Number,
    }
}, {timestamps: true, versionKey: false});

productSchema.methods.calculateAverageRating = function(): number  {
    let noOfReviews: number = (this.ratings.length === 0) ? 1 : this.ratings.length ;

    let sumOfStars: number = this.ratings.map((rating: Rating) => rating.star)
        .reduce((prev: number, curr: number) => prev + curr);

    return Number((sumOfStars/noOfReviews).toFixed(1));
}

const Product: Model<Product> = mongoose.model("Product", productSchema);
export default Product;