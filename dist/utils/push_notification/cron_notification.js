"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cornNotification = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const push_notificatio_model_1 = __importDefault(require("../../models/push_notificatio.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const aggretion_1 = require("./aggretion");
const push_1 = require("./push");
const cornNotification = async () => {
    let allNotifications = await push_notificatio_model_1.default.find({ status: 'scheduled' });
    if (allNotifications) {
        allNotifications.map(async (data) => {
            const serverTime = new Date();
            // Set your scheduled time
            const temp_time = String(data.scheduled_date);
            const scheduledTime = new Date(temp_time);
            // Compare the current server time with your scheduled time
            if (serverTime >= scheduledTime) {
                if (data.to_users === 'all_user') {
                    const tokens = await user_model_1.default.aggregate(aggretion_1.allUserFcmArray);
                    const fcm_tokens = tokens[0].fcm_tokens;
                    fcm_tokens.map(async (token) => {
                        // @ts-ignore
                        // @ts-ignore
                        const response = await (0, push_1.sendNotification)(token, data.title, data.body);
                        // if (response) {
                        //     console.log('Successfully sent message');
                        // } else {
                        //     console.log('Error sending message');
                        // }
                    });
                    // @ts-ignore
                    await push_notificatio_model_1.default.findByIdAndUpdate(data._id, { status: 'sent' });
                }
                else if (data.to_users === 'driver') {
                    const data = await user_model_1.default.aggregate(aggretion_1.driverFcmArray);
                    const fcm_tokens = data[0].fcm_tokens;
                    fcm_tokens.map(async (token) => {
                        // @ts-ignore
                        const response = await (0, push_1.sendNotification)(token, data.title, data.body);
                        if (response) {
                        }
                        else {
                        }
                    });
                    // @ts-ignore
                    await push_notificatio_model_1.default.findByIdAndUpdate(data._id, { status: 'sent' });
                }
                else if (data.to_users === 'user') {
                    const data = await user_model_1.default.aggregate(aggretion_1.userFcmArray);
                    const fcm_tokens = data[0].fcm_tokens;
                    fcm_tokens.map(async (token) => {
                        // @ts-ignore
                        const response = await (0, push_1.sendNotification)(token, data.title, data.body);
                        if (response) {
                        }
                        else {
                        }
                    });
                    // @ts-ignore
                    await push_notificatio_model_1.default.findByIdAndUpdate(data._id, { status: 'sent' });
                }
                else if (data.to_users === 'employee') {
                    const data = await user_model_1.default.aggregate(aggretion_1.employeeFcmArray);
                    const fcm_tokens = data[0].fcm_tokens;
                    fcm_tokens.map(async (token) => {
                        // @ts-ignore
                        const response = await (0, push_1.sendNotification)(token, data.title, data.body);
                        if (response) {
                            console.log('Successfully sent message');
                        }
                        else {
                            console.log('Error sending message');
                        }
                    });
                    // @ts-ignore
                    await push_notificatio_model_1.default.findByIdAndUpdate(data._id, { status: 'sent' });
                }
            }
        });
    }
};
exports.cornNotification = cornNotification;
//# sourceMappingURL=cron_notification.js.map