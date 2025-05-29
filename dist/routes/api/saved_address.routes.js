"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const saved_address_controller_1 = require("../../controllers/saved_address.controller");
const savedAddressRoutes = (0, express_1.Router)();
savedAddressRoutes.post('/', (0, auth_1.userAuth)({ isAuth: true }), saved_address_controller_1.postSavedAddress);
savedAddressRoutes.get('/list', (0, auth_1.userAuth)({ isAuth: true }), saved_address_controller_1.getSavedAddress);
savedAddressRoutes.get('/', (0, auth_1.userAuth)({ isAuth: true }), saved_address_controller_1.getSavedAddress);
savedAddressRoutes.delete('/', (0, auth_1.userAuth)({ isAuth: true }), saved_address_controller_1.delSavedAddress);
exports.default = savedAddressRoutes;
//# sourceMappingURL=saved_address.routes.js.map