import mongoose, {Schema, Model, Types} from "mongoose";
import bcrypt from "bcrypt";
import {Role, User} from "../interface/User";
import * as crypto from "crypto";

let userSchema: Schema<User> = new Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: Role.USER
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        type: [Types.ObjectId],
        default: []
    },
    address: [{
        type: Types.ObjectId,
        ref: "Address"
    }],
    wishlist: [{
        type: Types.ObjectId,
        ref: "Product"
    }],
    refresh_token: {
        type: String,
        default: null
    },
    password_updated_at: {
        type: Date,
        default: null
    },
    password_reset_token: {
        type: String,
        default: null
    },
    password_token_expiration: {
        type: String,
         default: null
    }
}, {
    versionKey: false,
    timestamps: true
});

userSchema.pre<User>("save", async function (next) {
    if (!this.isModified("password")) {
        next();
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.doesPasswordMatch = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.createPasswordResetToken = async function () {
    const resetToken: string = crypto.randomBytes(32).toString("hex");
    this.password_reset_token = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")
    this.password_token_expiration = Date.now() + 20 * 60 * 1000;

    return resetToken;
}

const User: Model<User> = mongoose.model("User", userSchema);
export default User;