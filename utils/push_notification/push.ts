import Settings from "../../models/settings.model";

var admin = require("firebase-admin");
const init_admin = async () => {
    const setting = await Settings.findOne()
    try {
        const value = JSON.parse(setting.push_notification_json.json_value)
        admin.initializeApp({
            credential: admin.credential.cert(value)
        });
    } catch (e) {
    }
    return admin
}

export default admin;

const sendNotification = async (token, title, body) => {
    const admin = await init_admin()
    const data = {
        message: {
            token: token,
            notification: {
                title,
                body
            }
        },
    };
    try {
        await admin.messaging().send(data.message);
        return true;
    } catch (e) {
        return false
    }
}

export {sendNotification};
