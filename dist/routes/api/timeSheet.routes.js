"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const timeSheetRoutes = (0, express_1.Router)();
const timeSheet_controller_1 = require("../../controllers/timeSheet.controller");
// get
timeSheetRoutes.get('/', timeSheet_controller_1.getTimeSheet);
exports.default = timeSheetRoutes;
//# sourceMappingURL=timeSheet.routes.js.map