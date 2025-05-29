"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const vehicle_controller_1 = require("../../controllers/vehicle.controller");
const vehicleRoutes = (0, express_1.Router)();
// vehicle
vehicleRoutes.get('/list', (0, auth_1.userAuth)({ isAdmin: true }), vehicle_controller_1.fetchVehicleList);
vehicleRoutes.get('/', (0, auth_1.userAuth)({ isAuth: true }), vehicle_controller_1.fetchVehicle);
vehicleRoutes.get('/driver-wise', (0, auth_1.userAuth)({ isDriver: true }), vehicle_controller_1.fetchVehicleDriverWise);
vehicleRoutes.post('/driver-document', (0, auth_1.userAuth)({ isAuth: true }), vehicle_controller_1.vehicleDocumentUpdate);
vehicleRoutes.get('/driver-document', (0, auth_1.userAuth)({ isAuth: true }), vehicle_controller_1.getDriverDocument);
vehicleRoutes.get('/service-wise-list', vehicle_controller_1.fetchServiceWiseVehicles);
vehicleRoutes.get('/details', vehicle_controller_1.nearestSelectedVehicleDetails);
vehicleRoutes.get('/verify', (0, auth_1.userAuth)({ isDriver: true }), vehicle_controller_1.verifyDriverVehicle);
vehicleRoutes.post('/', (0, auth_1.userAuth)({ isAuth: true }), vehicle_controller_1.createVehicle);
vehicleRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, vehicle_controller_1.delVehicle);
vehicleRoutes.post('/setting', (0, auth_1.userAuth)({ isAdmin: true }), vehicle_controller_1.createVehicleSetting);
vehicleRoutes.get('/setting/list', (0, auth_1.userAuth)({ isAdmin: true }), vehicle_controller_1.fetchVehicleSettings);
vehicleRoutes.get('/setting', (0, auth_1.userAuth)({ isAdmin: true }), vehicle_controller_1.fetchVehicleSetting);
vehicleRoutes.delete('/setting', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, vehicle_controller_1.deleteVehicleSetting);
vehicleRoutes.post('/update-driver-location', vehicle_controller_1.updateDriverLocation);
vehicleRoutes.post('/update-active-status', vehicle_controller_1.updateVehicleActive);
vehicleRoutes.post('/nearest-vehicle-search', vehicle_controller_1.nearVehicleSearchFromUserPoint);
vehicleRoutes.post('/distance-calculation', vehicle_controller_1.distanceCalculationFromUserLocationToDestination);
vehicleRoutes.post('/fare', vehicle_controller_1.getFare);
vehicleRoutes.post('/fare-distance', vehicle_controller_1.getTestingRideDistance);
// service vehicle information
vehicleRoutes.post('/information/create', vehicle_controller_1.postVehicleInfo);
vehicleRoutes.get('/information', vehicle_controller_1.getVehicleInfo);
vehicleRoutes.get('/info-all', vehicle_controller_1.getAllVehicleInfo);
// new API
vehicleRoutes.post('/nearest-me', vehicle_controller_1.nearestVehiclesAndServiceVehicleTypes);
vehicleRoutes.get('/current-position', (0, auth_1.userAuth)({ isAuth: true }), vehicle_controller_1.getCurrentDriverPosition);
exports.default = vehicleRoutes;
//# sourceMappingURL=vehicle.routes.js.map