"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTwilioSMS = void 0;
const settings_model_1 = __importDefault(require("../models/settings.model"));
const sendTwilioSMS = async (to, body) => {
    const setting = await settings_model_1.default.findOne({});
    const authToken = setting.sms.twilio_auth_token;
    const accountSid = setting.sms.twilio_account_sid;
    const client = require("twilio")(accountSid, authToken);
    client.messages
        .create({
        body,
        to,
        from: setting.sms.twilio_sender_number
    })
        .then((message) => {
        console.log(message);
    })
        .catch((error) => console.log(error));
};
exports.sendTwilioSMS = sendTwilioSMS;
//# sourceMappingURL=sms.js.map