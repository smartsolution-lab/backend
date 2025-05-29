"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roleRoutes = (0, express_1.Router)();
const auth_1 = require("../../auth");
const role_controller_1 = require("../../controllers/role.controller");
roleRoutes.post('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, role_controller_1.postRole);
roleRoutes.get('/list', role_controller_1.getRoles);
roleRoutes.get('/department-wise-list', (0, auth_1.userAuth)({ isAdmin: true }), role_controller_1.departmentWiseList);
roleRoutes.get('/', role_controller_1.getRole);
roleRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, role_controller_1.deleteRole);
roleRoutes.post('/permissions', role_controller_1.postPermissions);
roleRoutes.get('/permissions', role_controller_1.getPermissions);
exports.default = roleRoutes;
//# sourceMappingURL=role.routes.js.map