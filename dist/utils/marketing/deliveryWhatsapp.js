"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsappSms = void 0;
const marketing_setting_model_1 = __importDefault(require("../../models/marketing_setting.model"));
const sendWhatsappSms = async (to, body) => {
    const setting = await marketing_setting_model_1.default.findOne({});
    const authToken = setting.whatsapp.twilio_auth_token;
    const accountSid = setting.whatsapp.twilio_account_sid;
    const client = require("twilio")(accountSid, authToken);
    to.forEach((number) => {
        try {
            const data = client.messages
                .create({
                body,
                to: 'whatsapp:' + number,
                from: 'whatsapp:' + setting.whatsapp.twilio_sender_number
            });
        }
        catch (e) {
        }
    });
    return true;
};
exports.sendWhatsappSms = sendWhatsappSms;
//# sourceMappingURL=deliveryWhatsapp.js.map