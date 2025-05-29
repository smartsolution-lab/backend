"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const booking_controller_1 = require("../../controllers/booking.controller");
const bookingRoutes = (0, express_1.Router)();
bookingRoutes.post('/', (0, auth_1.userAuth)({ isUser: true }), booking_controller_1.postBooking);
bookingRoutes.post('/update-status', (0, auth_1.userAuth)({ isDriver: true }), booking_controller_1.bookingRequestUpdateByDriver);
bookingRoutes.post('/confirmation', (0, auth_1.userAuth)({ isAdmin: true }), booking_controller_1.bookingConfirmation);
bookingRoutes.get('/list', (0, auth_1.userAuth)({ isAuth: true }), booking_controller_1.getBookingList);
bookingRoutes.get('/', booking_controller_1.getBooking);
bookingRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), booking_controller_1.delBooking);
exports.default = bookingRoutes;
//# sourceMappingURL=booking.routes.js.map