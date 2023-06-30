import {Document, Types} from "mongoose";

export enum Role {
    USER = "user",
    ADMIN = "admin"
}

export interface User extends Document {
    first_name: string;
    last_name: string;
    email: string;
    mobile: string;
    role: Role;
    is_blocked: boolean;
    password: string;
    cart: Types.ObjectId[];
    address: Types.ObjectId[];
    wishlist: Types.ObjectId[];
    refresh_token?: string;
    password_updated_at: Date;
    password_reset_token?: string;
    password_token_expiration?: string

    doesPasswordMatch(password: string): Promise<boolean>;
    createPasswordResetToken(): Promise<string>
}