"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTwilioMarketingSms = void 0;
const marketing_setting_model_1 = __importDefault(require("../../models/marketing_setting.model"));
const sendTwilioMarketingSms = async (to, body) => {
    const setting = await marketing_setting_model_1.default.findOne({});
    const authToken = setting.sms.twilio_auth_token;
    const accountSid = setting.sms.twilio_account_sid;
    const client = require("twilio")(accountSid, authToken);
    try {
        await client.messages
            .create({
            body,
            to,
            from: setting.sms.twilio_sender_number
        });
        return true;
    }
    catch (e) {
        return false;
    }
};
exports.sendTwilioMarketingSms = sendTwilioMarketingSms;
//# sourceMappingURL=deliverySMS.js.map