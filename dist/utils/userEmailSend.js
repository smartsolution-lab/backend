"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUserEmailGeneral = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const settings_model_1 = __importDefault(require("../models/settings.model"));
const nodemailer = require("nodemailer");
dotenv_1.default.config();
const sendUserEmailGeneral = async (data) => {
    const settings = await settings_model_1.default.findOne({});
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
    // config for end user
    const info = await transporter.sendMail({
        from: from_email,
        to: data.email,
        subject: data.subject,
        html: data.message, // html body
    });
    return info;
};
exports.sendUserEmailGeneral = sendUserEmailGeneral;
//# sourceMappingURL=userEmailSend.js.map