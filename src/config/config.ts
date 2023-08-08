import dotenv from "dotenv";
import * as process from "process";

dotenv.config();

export const config = {
    mongo: {
        url: process.env.MONGO_URL || ""
    },
    server: {
        app_name: process.env.APP_NAME,
        env: process.env.NODE_ENV || "local",
        port: process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 8000,
        url: process.env.BASE_URL || `http://localhost:8000`,
        bcrypt_rounds: process.env.BCRYPT_ROUNDS ? Number(process.env.BCRYPT_ROUNDS) : 10,

        jwt_access_secret: process.env.ACCESS_TOKEN_SECRET || "",
        jwt_refresh_secret: process.env.REFRESH_TOKEN_SECRET || "",
        jwt_reset_secret: process.env.RESET_TOKEN_SECRET || "",
    },
    mailer: {
        host: process.env.SMTP_HOST || "smtp.sendgrid.net",
        port: Number(process.env.SMTP_PORT) ? Number(process.env.SMTP_PORT) : 465,
        tls: process.env.SMTP_TLS || "yes",
        username: process.env.SMTP_USERNAME || "",
        password: process.env.SMTP_PASSWORD || "",
        sender: process.env.SMTP_SENDER || "hello@koomia.com"
    },
    message: {
        auth_token: process.env.TWILIO_AUTH_TOKEN,
        sid: process.env.TWILIO_ACCOUNT_SID,
        phone: process.env.TWILIO_PHONE_NUMBER
    },
    cloudinary: {
        name: process.env.CLOUDINARY_NAME,
        key: process.env.CLOUDINARY_KEY,
        secret: process.env.CLOUDINARY_SECRET
    },
    payment_provider: {
        paystack: {
            secret_key: process.env.PAYSTACK_SECRET_KEY
        },
        flutterwave: {
            public_key: process.env.FLUTTERWAVE_PUBLIC_KEY || "",
            secret_key: process.env.FLUTTERWAVE_SECRET_KEY || ""
        },
        paypal: {
            client_id: process.env.PAYPAL_CLIENT_ID as string,
            secret_key: process.env.PAYPAL_SECRET_KEY as string
        },
        stripe: {
            api_key: process.env.STRIPE_API_KEY as string
        }
    }
}