"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const withdraw_controller_1 = require("../../controllers/withdraw.controller");
const withdrawRoutes = (0, express_1.Router)();
withdrawRoutes.post('/', (0, auth_1.userAuth)({ isDriver: true }), withdraw_controller_1.postWithdraw);
withdrawRoutes.post('/update', (0, auth_1.userAuth)({ isAdmin: true }), withdraw_controller_1.updateWithdraw);
withdrawRoutes.get('/driver-list', (0, auth_1.userAuth)({ isDriver: true }), withdraw_controller_1.getWithdraws);
withdrawRoutes.get('/list', (0, auth_1.userAuth)({ isAdmin: true }), withdraw_controller_1.getWithdraws);
withdrawRoutes.get('/', (0, auth_1.userAuth)({ isAuth: true }), withdraw_controller_1.getWithdraw);
// getUserWalletShortInfo
withdrawRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, withdraw_controller_1.delWithdraw);
exports.default = withdrawRoutes;
//# sourceMappingURL=withdraw.routes.js.map