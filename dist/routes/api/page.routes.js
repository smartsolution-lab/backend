"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const page_controller_1 = require("../../controllers/page.controller");
const auth_1 = require("../../auth");
const pageRoutes = (0, express_1.Router)();
pageRoutes.get('/', page_controller_1.getPage);
pageRoutes.get('/about-us', page_controller_1.getAppPage);
pageRoutes.get('/contact-page', page_controller_1.getAppPageContactUse);
pageRoutes.get('/terms-conditions', page_controller_1.getAppPage);
pageRoutes.get('/privacy-policy', page_controller_1.getAppPage);
pageRoutes.get('/help-and-support', page_controller_1.getAppPage);
pageRoutes.post('/', page_controller_1.postPage);
pageRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, page_controller_1.delPage);
pageRoutes.get('/custom-page', page_controller_1.getCustomPage);
exports.default = pageRoutes;
//# sourceMappingURL=page.routes.js.map