"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const couponRoutes = (0, express_1.Router)();
const coupon_controller_1 = require("../../controllers/coupon.controller");
const auth_1 = require("../../auth");
couponRoutes.post('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, coupon_controller_1.createCoupon);
couponRoutes.post('/apply', (0, auth_1.userAuth)({ isAuth: true }), coupon_controller_1.couponApply);
couponRoutes.get('/', (0, auth_1.userAuth)({ isAuth: true }), coupon_controller_1.getCoupon);
couponRoutes.get('/offer', (0, auth_1.userAuth)({ isAuth: true }), coupon_controller_1.getCouponOffer);
couponRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, coupon_controller_1.delCoupon);
exports.default = couponRoutes;
//# sourceMappingURL=coupon.routes.js.map