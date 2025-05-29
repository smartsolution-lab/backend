"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const dashboard_controller_1 = require("../../controllers/dashboard.controller");
const report_controller_1 = require("../../controllers/report.controller");
const reportRoutes = (0, express_1.Router)();
reportRoutes.get('/driver-earning', (0, auth_1.userAuth)({ isDriver: true }), dashboard_controller_1.getDriverDashBoardGraphData);
reportRoutes.get('/company-earning', (0, auth_1.userAuth)({ isAuth: true }), dashboard_controller_1.getAdminDashBoardEarningGraphData);
reportRoutes.get('/complete-cancel-donut', (0, auth_1.userAuth)({ isAuth: true }), dashboard_controller_1.getAdminDonutChartCompleteCancel);
reportRoutes.get('/user-expenses', (0, auth_1.userAuth)({ isUser: true }), dashboard_controller_1.getUserExpensesGraphData);
reportRoutes.get('/');
// get
reportRoutes.get('/users', report_controller_1.getUserReport);
reportRoutes.get('/drivers', report_controller_1.getDriverReport);
reportRoutes.get('/company', report_controller_1.getCompanyReport);
exports.default = reportRoutes;
//# sourceMappingURL=report.routes.js.map