"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketing_controller_1 = require("../../controllers/marketing.controller");
const marketingRoutes = (0, express_1.Router)();
//group CRUD routes
marketingRoutes.get('/groups', marketing_controller_1.getMarketingGroups);
marketingRoutes.post('/groups', marketing_controller_1.postMarketingGroups);
marketingRoutes.delete('/groups', marketing_controller_1.delMarketingGroups);
//Marketing Users Routes
marketingRoutes.get('/subscriber', marketing_controller_1.getSubscribedUsers);
marketingRoutes.post('/subscriber', marketing_controller_1.postSubscribeUsers);
marketingRoutes.get('/users', marketing_controller_1.getAllUsers);
marketingRoutes.post('/users', marketing_controller_1.postAllUsers);
marketingRoutes.get('/available-user', marketing_controller_1.getAvailableUsers);
marketingRoutes.post('/available-user', marketing_controller_1.postUsers);
//email configuration & send Route
marketingRoutes.get('/', marketing_controller_1.getSettings);
marketingRoutes.post('/', marketing_controller_1.updateSettings);
//email routes
marketingRoutes.get('/all-mail', marketing_controller_1.getAllMail);
marketingRoutes.post('/deliver-email', marketing_controller_1.postDeliveryEmail);
marketingRoutes.delete('/deliver-email', marketing_controller_1.delDeliveryEmail);
//sms routes
marketingRoutes.get('/all-sms', marketing_controller_1.getAllSMS);
marketingRoutes.post('/deliver-sms', marketing_controller_1.postDeliverySMS);
marketingRoutes.delete('/deliver-sms', marketing_controller_1.delDeliverySMS);
marketingRoutes.get('/all-whatsapp-message', marketing_controller_1.getAllWhatsappMessage);
marketingRoutes.post('/deliver-whatsapp-message', marketing_controller_1.postWhatsappMessage);
marketingRoutes.delete('/deliver-whatsapp-message', marketing_controller_1.delWhatsappMessage);
exports.default = marketingRoutes;
//# sourceMappingURL=marketing.routes.js.map