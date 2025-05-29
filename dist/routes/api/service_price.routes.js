"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const service_price_controller_1 = require("../../controllers/service_price.controller");
const servicePriceRoutes = (0, express_1.Router)();
servicePriceRoutes.post('/create', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_price_controller_1.createServicePrice);
servicePriceRoutes.get('/', service_price_controller_1.getServicePriceById);
servicePriceRoutes.get('/list', service_price_controller_1.getServicePrices);
servicePriceRoutes.get('/get-one', service_price_controller_1.getOneServicePrice);
servicePriceRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_price_controller_1.deleteServicePrice);
exports.default = servicePriceRoutes;
//# sourceMappingURL=service_price.routes.js.map