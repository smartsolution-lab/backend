"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaveRoutes = (0, express_1.Router)();
const leave_controller_1 = require("../../controllers/leave.controller");
const auth_1 = require("../../auth");
// post 
leaveRoutes.post('/', (0, auth_1.userAuth)({ isAdmin: true }), leave_controller_1.postLeave);
// get
leaveRoutes.get('/', leave_controller_1.getLeave);
// delete
leaveRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), leave_controller_1.delLeave);
exports.default = leaveRoutes;
//# sourceMappingURL=leave.routes.js.map