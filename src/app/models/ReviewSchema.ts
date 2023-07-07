import mongoose, {Document, Model, Schema, Types} from "mongoose";


export interface Rating {
    stars: number;
    comment: string,
    posted_by: Types.ObjectId;
}
interface Review extends Document {
    product: Types.ObjectId,
    ratings: Rating[],
    average_stars: number
}

let reviewSchema: Schema<Review> = new Schema<Review>({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    ratings: [{
        stars: Number,
        comment: String,
        posted_by: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    }],
    average_stars: Number
}, {versionKey: false, timestamps: true});


// Changed it from "pre" to "post"
reviewSchema.post<Review>('save', function (next) {
    const ratings: Rating[] = this.ratings;
    let totalStars: number = 0;

    if (ratings.length > 0) {
        totalStars = ratings.reduce((sum: number, rating: Rating) => sum + rating.stars, 0);
        this.average_stars = Number((totalStars / ratings.length).toFixed(2));
    } else {
        this.average_stars = 0;
    }
    // next();
});

const Review: Model<Review> = mongoose.model("Review", reviewSchema);

export default Review;