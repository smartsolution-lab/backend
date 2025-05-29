"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const push_notification_controller_1 = require("../../controllers/push_notification.controller");
const pushNotification = (0, express_1.Router)();
pushNotification.get('/', push_notification_controller_1.getNotification);
pushNotification.post('/', push_notification_controller_1.postNotification);
pushNotification.get('/status', (0, auth_1.userAuth)({ isAuth: true }), push_notification_controller_1.getNotificationStatus);
pushNotification.post('/status', (0, auth_1.userAuth)({ isAuth: true }), push_notification_controller_1.postNotificationStatus);
pushNotification.post('/SettingJon', push_notification_controller_1.SettingJon);
exports.default = pushNotification;
//# sourceMappingURL=pushNotification.js.map