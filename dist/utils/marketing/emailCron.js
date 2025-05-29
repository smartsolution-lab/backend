"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cornEmail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const marketing_setting_model_1 = __importDefault(require("../../models/marketing_setting.model"));
const marketing_mails_model_1 = __importDefault(require("../../models/marketing_mails.model"));
const cron = require('node-cron');
const nodemailer = require("nodemailer");
dotenv_1.default.config();
const cornEmail = async () => {
    let allMails = await marketing_mails_model_1.default.find({ status: 'scheduled' }).populate("group");
    if (allMails) {
        allMails.map(async (data) => {
            const serverTime = new Date();
            // Set your scheduled time
            const temp_time = String(data.scheduled_date);
            const scheduledTime = new Date(temp_time);
            // Compare the current server time with your scheduled time
            if (serverTime >= scheduledTime) {
                let to = data.to;
                // @ts-ignore
                const { transporter, from_email } = await config();
                try {
                    await transporter.sendMail({
                        from: from_email,
                        to: to,
                        subject: data.subject,
                        html: data.content,
                    });
                    data.status = 'success';
                    await data.save();
                }
                catch (e) {
                    data.status = 'failed';
                    await data.save();
                    return false;
                }
            }
        });
    }
};
exports.cornEmail = cornEmail;
const config = async () => {
    const settings = await marketing_setting_model_1.default.findOne({});
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
    }
    else if (settings?.email?.default === 'gmail') {
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
        from_email = settings?.email?.gmail?.auth_email;
    }
    return { transporter, from_email };
};
//# sourceMappingURL=emailCron.js.map