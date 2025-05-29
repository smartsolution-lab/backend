import Settings from '../../models/settings.model'
import MarketingSettings from "../../models/marketing_setting.model";

export const sendTwilioMarketingSms = async (to, body) => {
    const setting = await MarketingSettings.findOne({});
    const authToken = setting.sms.twilio_auth_token;
    const accountSid = setting.sms.twilio_account_sid;
    const client = require("twilio")(accountSid, authToken);

    try {
        await client.messages
            .create({
                body,
                to,
                from: setting.sms.twilio_sender_number
            })
        return true
    } catch (e) {
        return false;
    }


}
