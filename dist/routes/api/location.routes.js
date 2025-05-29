"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const locations_controller_1 = require("../../controllers/locations.controller");
const locationRoutes = (0, express_1.Router)();
locationRoutes.post('/', locations_controller_1.postLocation);
locationRoutes.get('/list', locations_controller_1.getLocationList);
locationRoutes.get('/check-user-inside-location', locations_controller_1.userAreaCheckInsideOfMap);
locationRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, locations_controller_1.delLocation);
exports.default = locationRoutes;
//# sourceMappingURL=location.routes.js.map