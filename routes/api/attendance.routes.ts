import { Router } from 'express';
const attendanceRoutes = Router();

import {
   postAttendanceSetting, getAttendanceSetting, delAttendanceSetting,
   postAttendance, getAttendance, delAttendance, getEmployeePlusLastPunch,
   getEmployeePunchInOut, clockIn, clockOut, getOneClockInOut, breakTimeStart
} from '../../controllers/attendance.controller';
import { userAuth } from '../../auth';


// attendance setting
attendanceRoutes.post('/setting', userAuth({isAdmin: true}), postAttendanceSetting);
attendanceRoutes.get('/setting', getAttendanceSetting);
attendanceRoutes.delete('/setting', userAuth({isAdmin: true}), delAttendanceSetting);

// attendance
attendanceRoutes.post('/', userAuth({isAdmin: true}), postAttendance);
attendanceRoutes.get('/', getAttendance);
attendanceRoutes.get('/employee-punch', getEmployeePlusLastPunch);
attendanceRoutes.get('/punch-in-out', getEmployeePunchInOut);
attendanceRoutes.delete('/', userAuth({isAdmin: true}), delAttendance);

// clock in-out
attendanceRoutes.get('/clock-in', userAuth({isAdmin: true}), clockIn);
attendanceRoutes.get('/clock-out', userAuth({isAdmin: true}), clockOut);
attendanceRoutes.get('/clock-in-out', getOneClockInOut);

// break-time
attendanceRoutes.get('/break-time-start', breakTimeStart);

export default attendanceRoutes;