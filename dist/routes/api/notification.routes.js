"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const notification_controller_1 = require("../../controllers/notification.controller");
const Notification = (0, express_1.Router)();
Notification.get('/', (0, auth_1.userAuth)({ isAuth: true }), notification_controller_1.getNotification);
Notification.get('/all-notification', (0, auth_1.userAuth)({ isAuth: true }), notification_controller_1.getAllNotification);
Notification.post('/', notification_controller_1.postNotification);
Notification.post('/update', notification_controller_1.updateNotification);
exports.default = Notification;
//# sourceMappingURL=notification.routes.js.map