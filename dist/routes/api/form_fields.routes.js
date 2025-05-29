"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const form_fields_controller_1 = require("../../controllers/form_fields.controller");
const formFieldRoutes = (0, express_1.Router)();
formFieldRoutes.post('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, form_fields_controller_1.postFormFiled);
formFieldRoutes.get('/list', form_fields_controller_1.getAll);
formFieldRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, form_fields_controller_1.deleteField);
exports.default = formFieldRoutes;
//# sourceMappingURL=form_fields.routes.js.map