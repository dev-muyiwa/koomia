import mongoose, {Schema, Model, Types, Document} from "mongoose";
import bcrypt from "bcrypt";
import * as crypto from "crypto";
import {config} from "../config/config";
import {addMinutesToDate} from "../utils/helpers";
import JwtService from "../services/JwtService";
import {Role} from "./enums/enum";

type UserDocument = Document & {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    avatar: {
        url: string,
        publicId: string
    },
    role: string;
    isBlocked: boolean;
    password: string;
    addresses: Types.ObjectId[];
    isVerified: boolean;
    otp?: {
        code: string,
        expiresAt: string
    }
    refreshToken?: string;
    passwordResetToken?: string;

    doesPasswordMatch(password: string): Promise<boolean>;
    createPasswordResetToken(): Promise<string>
    getBasicInfo(): object;
}


let UserSchema: Schema<UserDocument> = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        url: {
            type: String,
            required: false
        },
        publicId: {
            type: String,
            required: false
        }
    },
    role: {
        type: String,
        default: Role.USER
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    addresses: [{
        type: Types.ObjectId,
        ref: "Address"
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: {
            type: String,
        },
        expiresAt: {
            type: String,
        }
    },
    refreshToken: {
        type: String,
        default: null
    },
    passwordResetToken: {
        type: String,
        default: null
    }
}, {
    versionKey: false,
    timestamps: true,
});


UserSchema.methods.doesPasswordMatch = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.createPasswordResetToken = async function () {
    const resetToken: string = JwtService.generateResetToken(this._id, this.email);
    this.passwordResetToken = resetToken

    return resetToken;
}

const UserModel: Model<UserDocument> = mongoose.model("User", UserSchema);

UserModel.prototype.getBasicInfo = function () {
    const {id, firstName, lastName, email, mobile, isBlocked, avatar} = this as UserDocument;

    return {id, firstName, lastName, email, mobile, isBlocked, avatar};
}

export {
    UserModel, UserDocument
};