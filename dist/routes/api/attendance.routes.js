"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendanceRoutes = (0, express_1.Router)();
const attendance_controller_1 = require("../../controllers/attendance.controller");
const auth_1 = require("../../auth");
// attendance setting
attendanceRoutes.post('/setting', (0, auth_1.userAuth)({ isAdmin: true }), attendance_controller_1.postAttendanceSetting);
attendanceRoutes.get('/setting', attendance_controller_1.getAttendanceSetting);
attendanceRoutes.delete('/setting', (0, auth_1.userAuth)({ isAdmin: true }), attendance_controller_1.delAttendanceSetting);
// attendance
attendanceRoutes.post('/', (0, auth_1.userAuth)({ isAdmin: true }), attendance_controller_1.postAttendance);
attendanceRoutes.get('/', attendance_controller_1.getAttendance);
attendanceRoutes.get('/employee-punch', attendance_controller_1.getEmployeePlusLastPunch);
attendanceRoutes.get('/punch-in-out', attendance_controller_1.getEmployeePunchInOut);
attendanceRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), attendance_controller_1.delAttendance);
// clock in-out
attendanceRoutes.get('/clock-in', (0, auth_1.userAuth)({ isAdmin: true }), attendance_controller_1.clockIn);
attendanceRoutes.get('/clock-out', (0, auth_1.userAuth)({ isAdmin: true }), attendance_controller_1.clockOut);
attendanceRoutes.get('/clock-in-out', attendance_controller_1.getOneClockInOut);
// break-time
attendanceRoutes.get('/break-time-start', attendance_controller_1.breakTimeStart);
exports.default = attendanceRoutes;
//# sourceMappingURL=attendance.routes.js.map