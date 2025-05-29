"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const department_controller_1 = require("../../controllers/department.controller");
const departmentRoutes = (0, express_1.Router)();
departmentRoutes.get('/list', department_controller_1.departmentList);
departmentRoutes.get('/elements', department_controller_1.getDepartmentElements);
departmentRoutes.get('/sub-department-list', department_controller_1.getDepartmentWiseSubDepartmentList);
departmentRoutes.get('/', department_controller_1.getDepartment);
departmentRoutes.post('/', department_controller_1.postDepartment);
departmentRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, department_controller_1.delDepartment);
exports.default = departmentRoutes;
//# sourceMappingURL=department.routes.js.map