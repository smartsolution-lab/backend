"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const holidayRoutes = (0, express_1.Router)();
const holiday_controller_1 = require("../../controllers/holiday.controller");
const auth_1 = require("../../auth");
// post 
holidayRoutes.post('/', (0, auth_1.userAuth)({ isAdmin: true }), holiday_controller_1.postHoliday);
// get
holidayRoutes.get('/', holiday_controller_1.getHoliday);
// delete
holidayRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), holiday_controller_1.delHoliday);
exports.default = holidayRoutes;
//# sourceMappingURL=holiday.routes.js.map