import nodemailer from "nodemailer";

export class MailingData {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    html: string;
}

export const sendMail = async (
    options: MailingData
) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_ENCRYPTION === 'tls',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });
    return await transporter
        .sendMail({
            from: `${process.env.MAIL_FROM_NAME}`,
            to: options.to,
            cc: options.cc,
            bcc: options.bcc,
            subject: options.subject,
            text: options.body,
            html: options.html,
        }).then(() => {
            console.log(`Email sent to ${options.to.length} recipient(s).`)
        })
}
