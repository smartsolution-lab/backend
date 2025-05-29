"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const rating_controller_1 = require("../../controllers/rating.controller");
const ratingRoutes = (0, express_1.Router)();
ratingRoutes.post('/driver', (0, auth_1.userAuth)({ isAuth: true }), rating_controller_1.postDriverRating);
ratingRoutes.get('/driver/list', rating_controller_1.getDriverRatings);
ratingRoutes.get('/list', rating_controller_1.getDriverRatings);
ratingRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), rating_controller_1.delDriverRating);
// tips and review
ratingRoutes.post('/driver/tips-wallet', (0, auth_1.userAuth)({ isAuth: true }), rating_controller_1.tipsThroughWallet);
ratingRoutes.post('/driver/tips-stripe', (0, auth_1.userAuth)({ isAuth: true }), rating_controller_1.tipsThroughStripe);
ratingRoutes.post('/driver/tips-paypal', (0, auth_1.userAuth)({ isAuth: true }), rating_controller_1.tipsThroughPaypal);
ratingRoutes.post('/driver/tips-mollie', (0, auth_1.userAuth)({ isAuth: true }), rating_controller_1.tipsThroughMollie);
ratingRoutes.post('/driver/tips-mollie-webhook', (0, auth_1.userAuth)({ isAuth: true }), rating_controller_1.tipsThroughMollieCheck);
exports.default = ratingRoutes;
//# sourceMappingURL=rating.routes.js.map