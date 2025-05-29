"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const settings_model_1 = __importDefault(require("../../models/settings.model"));
var admin = require("firebase-admin");
const init_admin = async () => {
    const setting = await settings_model_1.default.findOne();
    try {
        const value = JSON.parse(setting.push_notification_json.json_value);
        admin.initializeApp({
            credential: admin.credential.cert(value)
        });
    }
    catch (e) {
    }
    return admin;
};
exports.default = admin;
const sendNotification = async (token, title, body) => {
    const admin = await init_admin();
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
    }
    catch (e) {
        return false;
    }
};
exports.sendNotification = sendNotification;
//# sourceMappingURL=push.js.map