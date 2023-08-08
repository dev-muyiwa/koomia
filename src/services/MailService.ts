import nodemailer, {SentMessageInfo, Transporter} from "nodemailer";
import {config} from "../config/config";


const sendMail = async (to: string | string[], subject: string, html?: string, body?: string, ): Promise<void> => {
    try {
        const transporter: Transporter<SentMessageInfo> = nodemailer.createTransport({
            host: config.mailer.host,
            port: config.mailer.port,
            name: config.server.app_name,
            secure: config.mailer.tls === "yes",
            auth: {
                user: config.mailer.username,
                pass: config.mailer.password
            }
        });

        return await transporter
            .sendMail({
                from: config.mailer.sender,
                sender: config.mailer.sender,
                to: to,
                subject: subject,
                text: body,
                html: html
            });
    } catch (err) {
        throw err;
    }
}


export default {sendMail};