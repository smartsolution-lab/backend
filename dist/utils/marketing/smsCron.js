"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cornSms = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const marketing_sms_model_1 = __importDefault(require("../../models/marketing_sms.model"));
const deliverySMS_1 = require("./deliverySMS");
const cron = require('node-cron');
const nodemailer = require("nodemailer");
const cornSms = async () => {
    let allMails = await marketing_sms_model_1.default.find({ status: 'scheduled' }).populate("group");
    if (allMails) {
        allMails.map(async (data) => {
            const serverTime = new Date();
            // Set your scheduled time
            const temp_time = String(data.scheduled_date);
            const scheduledTime = new Date(temp_time);
            // Compare the current server time with your scheduled time
            if (serverTime >= scheduledTime) {
                let to = data.to;
                try {
                    to.forEach((x) => {
                        (0, deliverySMS_1.sendTwilioMarketingSms)(x, data.content);
                    });
                    let sms = await marketing_sms_model_1.default.findById(data._id);
                    sms.status = 'success';
                    sms.save();
                }
                catch (e) {
                    let sms = await marketing_sms_model_1.default.findById(data._id);
                    sms.status = 'failed';
                    sms.save();
                }
            }
        });
    }
};
exports.cornSms = cornSms;
//# sourceMappingURL=smsCron.js.map