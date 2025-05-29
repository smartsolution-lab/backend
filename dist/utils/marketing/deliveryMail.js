"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMarketingEmail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const marketing_setting_model_1 = __importDefault(require("../../models/marketing_setting.model"));
const cron = require('node-cron');
const nodemailer = require("nodemailer");
dotenv_1.default.config();
const sendMarketingEmail = async (data) => {
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
    try {
        const info = await transporter.sendMail({
            from: from_email,
            to: data.to,
            subject: data.subject,
            html: data.content,
        });
        return ({ from: from_email });
    }
    catch (e) {
        return false;
    }
};
exports.sendMarketingEmail = sendMarketingEmail;
//# sourceMappingURL=deliveryMail.js.map