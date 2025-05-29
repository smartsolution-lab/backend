import dotenv from 'dotenv';
import MarketingSettings from "../../models/marketing_setting.model";
import MarketingMail from "../../models/marketing_mails.model";
const cron = require('node-cron');
const nodemailer = require("nodemailer");
dotenv.config();

export const sendMarketingEmail = async (data) => {
    const settings = await MarketingSettings.findOne({});
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

    try {

        const info = await transporter.sendMail({
            from: from_email,
            to:  data.to,
            subject: data.subject,
            html: data.content,
        })

        return ({from:from_email});
    } catch (e) {
        return false;
    }

};




