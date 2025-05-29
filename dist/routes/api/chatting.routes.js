"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const chatting_controller_1 = require("../../controllers/chatting.controller");
const chattingRoutes = (0, express_1.Router)();
chattingRoutes.post('/', (0, auth_1.userAuth)({ isAuth: true }), chatting_controller_1.messageSend);
chattingRoutes.get('/list', (0, auth_1.userAuth)({ isAuth: true }), chatting_controller_1.messages);
chattingRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), chatting_controller_1.deleteMsg);
exports.default = chattingRoutes;
//# sourceMappingURL=chatting.routes.js.map