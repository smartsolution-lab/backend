"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const user_form_fields_controller_1 = require("../../controllers/user_form_fields.controller");
const userFormFields = (0, express_1.Router)();
userFormFields.post('/create', auth_1.isDemoRequest, user_form_fields_controller_1.createUserFormField);
userFormFields.post('/update', user_form_fields_controller_1.updateUserFormField);
userFormFields.get('/get-all', user_form_fields_controller_1.getAllUserFormField);
userFormFields.get('/get-one', user_form_fields_controller_1.getOneUserFormField);
userFormFields.get('/get-specific-role-data', user_form_fields_controller_1.getSpecificUserRoleFormData);
userFormFields.delete('/delete', auth_1.isDemoRequest, user_form_fields_controller_1.deleteUserFormField);
exports.default = userFormFields;
//# sourceMappingURL=user_form_field.routes.js.map