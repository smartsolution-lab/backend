"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const frontendRoutes = (0, express_1.Router)();
const auth_1 = require("../../auth");
const frontend_controller_1 = require("../../controllers/frontend.controller");
// LandingPage
frontendRoutes.post('/landing-page', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, frontend_controller_1.postLandingPage);
frontendRoutes.get('/landing-page', frontend_controller_1.getLandingPage);
frontendRoutes.delete('/landing-page', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, frontend_controller_1.delLandingPage);
frontendRoutes.post('/landing-page/contactUsInfo', frontend_controller_1.postContuctUsInfo);
// earn with share
frontendRoutes.post('/earn-with-share-page', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, frontend_controller_1.postEarnWithShare);
frontendRoutes.get('/earn-with-share-page', frontend_controller_1.getEarnWithShare);
exports.default = frontendRoutes;
//# sourceMappingURL=frontend.routes.js.map