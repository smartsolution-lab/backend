"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaveSettingsRoutes = (0, express_1.Router)();
const leave_setting_controller_1 = require("../../controllers/leave_setting.controller");
const auth_1 = require("../../auth");
// post 
leaveSettingsRoutes.post('/', (0, auth_1.userAuth)({ isAdmin: true }), leave_setting_controller_1.postLeaveSetting);
// get
leaveSettingsRoutes.get('/', leave_setting_controller_1.getLeaveSetting);
// delete
leaveSettingsRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), leave_setting_controller_1.delLeaveSetting);
exports.default = leaveSettingsRoutes;
//# sourceMappingURL=leave_setting.routes.js.map