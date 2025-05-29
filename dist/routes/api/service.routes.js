"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const service_categroy_controller_1 = require("../../controllers/service_categroy.controller");
const service_package_controller_1 = require("../../controllers/service_package.controller");
const service_controller_1 = require("../../controllers/service.controller");
const serviceCategoryRoutes = (0, express_1.Router)();
// service category
serviceCategoryRoutes.get('/category/list', (0, auth_1.userAuth)({ isAuth: true }), service_categroy_controller_1.fetchServiceCategories);
serviceCategoryRoutes.get('/category-list', service_categroy_controller_1.fetchServiceCategoriesForApp);
serviceCategoryRoutes.get('/category/elements', service_categroy_controller_1.getServiceCategoryElements);
serviceCategoryRoutes.get('/category', service_categroy_controller_1.fetchServiceCategory);
serviceCategoryRoutes.post('/category', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_categroy_controller_1.postServiceCategory);
serviceCategoryRoutes.delete('/category', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_categroy_controller_1.delServiceCategory);
serviceCategoryRoutes.post('/category/heading', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_categroy_controller_1.postCategoryHeading);
serviceCategoryRoutes.get('/category/heading', service_categroy_controller_1.getCategoryHeading);
serviceCategoryRoutes.post('/category/info', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_categroy_controller_1.postCategoryInfo);
serviceCategoryRoutes.get('/category/info', service_categroy_controller_1.getCategoryInfo);
serviceCategoryRoutes.delete('/category/info', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, (0, auth_1.userAuth)({ isAdmin: true }), service_categroy_controller_1.delCategoryInfo);
// service package
serviceCategoryRoutes.get('/package/list', service_package_controller_1.getServicePackages);
serviceCategoryRoutes.get('/package', service_package_controller_1.getServicePackage);
serviceCategoryRoutes.post('/package', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_package_controller_1.postServicePackage);
serviceCategoryRoutes.delete('/package', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_package_controller_1.delServicePackage);
// services
serviceCategoryRoutes.get('/list', service_controller_1.fetchServices);
serviceCategoryRoutes.get('/service-categories-packages', (0, auth_1.userAuth)({ isAuth: true }), service_controller_1.fetchCategoriesPackagesByService);
serviceCategoryRoutes.get('/category-wise-list', service_controller_1.fetchServicesCategoryWise);
serviceCategoryRoutes.get('/list-short-info', service_controller_1.fetchServiceList);
serviceCategoryRoutes.get('/', service_controller_1.fetchService);
serviceCategoryRoutes.get('/fetch-all', service_categroy_controller_1.fetchAllServicesInDetails);
serviceCategoryRoutes.post('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_controller_1.postService);
serviceCategoryRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_controller_1.delService);
// service vehicle
serviceCategoryRoutes.get('/vehicle/list', service_controller_1.fetchServiceVehicleList);
serviceCategoryRoutes.get('/vehicle', service_controller_1.fetchServiceVehicle);
serviceCategoryRoutes.post('/vehicle', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_controller_1.postServiceVehicle);
serviceCategoryRoutes.delete('/vehicle', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, service_controller_1.delServiceVehicle);
exports.default = serviceCategoryRoutes;
//# sourceMappingURL=service.routes.js.map