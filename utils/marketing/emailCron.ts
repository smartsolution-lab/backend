import dotenv from 'dotenv';
import MarketingSettings from "../../models/marketing_setting.model";
import MarketingMail from "../../models/marketing_mails.model";

const cron = require('node-cron');
const nodemailer = require("nodemailer");
dotenv.config();

export const cornEmail = async () => {
    let allMails = await MarketingMail.find({status: 'scheduled'}).populate("group")

    if (allMails) {
        allMails.map(async data => {
            const serverTime = new Date();
            // Set your scheduled time
            const temp_time = String(data.scheduled_date)
            const scheduledTime = new Date(temp_time);
            // Compare the current server time with your scheduled time
            if (serverTime >= scheduledTime) {
                let to = data.to
                // @ts-ignore
                const {transporter, from_email} = await config();
                try {
                    await transporter.sendMail({
                        from: from_email,
                        to: to,
                        subject: data.subject,
                        html: data.content,
                    })
                    data.status = 'success';
                    await data.save();
                } catch (e) {
                    data.status = 'failed';
                    await data.save();
                    return false;
                }
            }

        })
    }
};


const config = async () => {
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

    return {transporter, from_email};
}
