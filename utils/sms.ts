import Settings from '../models/settings.model'

export const sendTwilioSMS = async (to, body) => {
    const setting = await Settings.findOne({});
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
            console.log(message)
        })
        .catch((error) => console.log(error));
}