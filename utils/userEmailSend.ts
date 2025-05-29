import dotenv from 'dotenv';
import Settings from '../models/settings.model';
const nodemailer = require("nodemailer");
dotenv.config();

export const sendUserEmailGeneral = async (data) => {
    const settings = await Settings.findOne({});
    let transporter, from_email;

    // @ts-ignore
    if (settings?.email?.default === 'sendgrid') {
        transporter = nodemailer.createTransport({
            host: settings?.email?.sendgrid?.host,
            port: settings?.email?.sendgrid?.port,
            secure: false,
            auth: {
                user: settings?.email?.sendgrid?.sender_email,
                pass: settings?.email?.sendgrid?.password,
            },
        });

        // @ts-ignore
    } else if (settings?.email?.default === 'gmail') {
        transporter = nodemailer.createTransport({
            secure: false,
            // @ts-ignore
            service: settings?.email?.gmail?.service_provider,
            auth: {
                // @ts-ignore
                user: settings?.email?.gmail?.auth_email,
                // @ts-ignore
                pass: settings?.email?.gmail?.password,
            },
        });
        // @ts-ignore
        from_email = settings?.email?.gmail?.auth_email
    }

    // config for end user
    const info =  await transporter.sendMail({
        from: from_email,                // sender address
        to: data.email,                             // list of receivers
        subject: data.subject,              // Subject line
        html: data.message,   // html body
    })

    return info;
};