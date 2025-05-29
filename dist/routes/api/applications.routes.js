"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const applications_controller_1 = require("../../controllers/applications.controller");
const applicationRoutes = (0, express_1.Router)();
applicationRoutes.post('/create', applications_controller_1.createApplication);
applicationRoutes.post('/update', applications_controller_1.updateApplication);
applicationRoutes.post('/update-status', applications_controller_1.updateApplicationStatus);
applicationRoutes.get('/get-all', applications_controller_1.getAllApplication);
applicationRoutes.get('/get-one', applications_controller_1.getOneApplication);
applicationRoutes.delete('/delete', (0, auth_1.userAuth)({ isAdmin: true }), applications_controller_1.deleteApplication);
exports.default = applicationRoutes;
//# sourceMappingURL=applications.routes.js.map