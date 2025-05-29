"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cornWhatsapp = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const marketing_whatsapp_model_1 = __importDefault(require("../../models/marketing_whatsapp.model"));
const deliveryWhatsapp_1 = require("./deliveryWhatsapp");
const cron = require('node-cron');
const nodemailer = require("nodemailer");
const cornWhatsapp = async () => {
    let allMails = await marketing_whatsapp_model_1.default.find({ status: 'scheduled' }).populate("group");
    if (allMails) {
        allMails.map(async (data) => {
            const serverTime = new Date();
            // Set your scheduled time
            const temp_time = String(data.scheduled_date);
            const scheduledTime = new Date(temp_time);
            // Compare the current server time with your scheduled time
            if (serverTime >= scheduledTime) {
                let to = data.to;
                let whatsapp = await marketing_whatsapp_model_1.default.findById(data._id);
                //handle whatsapp
                (0, deliveryWhatsapp_1.sendWhatsappSms)(to, data.content).then((response) => {
                    // @ts-ignore
                    if (!!response) {
                        whatsapp.status = 'success';
                        whatsapp.save();
                    }
                    else {
                        whatsapp.status = 'failed';
                        whatsapp.save();
                    }
                });
            }
        });
    }
};
exports.cornWhatsapp = cornWhatsapp;
//# sourceMappingURL=whatsappCron.js.map