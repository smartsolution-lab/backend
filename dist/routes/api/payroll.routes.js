"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const payroll_controller_1 = require("../../controllers/payroll.controller");
const payrollRoutes = (0, express_1.Router)();
// employee salary
payrollRoutes.post('/salary', (0, auth_1.userAuth)({ isAdmin: true }), payroll_controller_1.postSalary);
payrollRoutes.get('/salary-list', (0, auth_1.userAuth)({ isAdmin: true }), payroll_controller_1.getSalaryList);
payrollRoutes.get('/salary-elements', payroll_controller_1.getSalaryElements);
payrollRoutes.delete('/salary', (0, auth_1.userAuth)({ isAdmin: true }), payroll_controller_1.delEmployeeSalary);
payrollRoutes.post('/salary-setting', (0, auth_1.userAuth)({ isAdmin: true }), payroll_controller_1.postPayrollSalarySetting);
payrollRoutes.get('/salary-setting', payroll_controller_1.getPayrollSalarySettings);
payrollRoutes.delete('/salary-setting', (0, auth_1.userAuth)({ isAdmin: true }), payroll_controller_1.delPayrollSalarySetting);
payrollRoutes.post('/advance-salary', (0, auth_1.userAuth)({ isAdmin: true }), payroll_controller_1.postPayrollAdvanceSalary);
payrollRoutes.get('/advance-salary', payroll_controller_1.getPayrollAdvanceSalaries);
payrollRoutes.delete('/advance-salary', (0, auth_1.userAuth)({ isAdmin: true }), payroll_controller_1.delPayrollAdvanceSalary);
exports.default = payrollRoutes;
//# sourceMappingURL=payroll.routes.js.map