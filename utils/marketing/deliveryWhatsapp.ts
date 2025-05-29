import Settings from '../../models/settings.model'
import MarketingSettings from "../../models/marketing_setting.model";

export const sendWhatsappSms = async (to, body) => {
    const setting = await MarketingSettings.findOne({});
    const authToken = setting.whatsapp.twilio_auth_token;
    const accountSid = setting.whatsapp.twilio_account_sid;
    const client = require("twilio")(accountSid, authToken);


    to.forEach((number) => {
        try {
           const data =  client.messages
                .create({
                    body,
                    to: 'whatsapp:' + number,
                    from: 'whatsapp:' + setting.whatsapp.twilio_sender_number
                })
        } catch (e) {

        }
    })
    return true;


}
