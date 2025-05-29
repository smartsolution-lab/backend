"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const operatingTimeRoutes = (0, express_1.Router)();
const operating_time_controller_1 = require("../../controllers/operating_time.controller");
const auth_1 = require("../../auth");
operatingTimeRoutes.post('/', (0, auth_1.userAuth)({ isAdmin: true }), operating_time_controller_1.postOperatingTime);
operatingTimeRoutes.get('/', operating_time_controller_1.getOperatingTimes);
operatingTimeRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), operating_time_controller_1.delOperatingTime);
exports.default = operatingTimeRoutes;
//# sourceMappingURL=operating_time.routes.js.map