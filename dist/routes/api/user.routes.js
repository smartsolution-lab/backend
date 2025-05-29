"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRoutes = (0, express_1.Router)();
const auth_1 = require("../../auth");
const user_controller_1 = require("../../controllers/user.controller");
const dashboard_controller_1 = require("../../controllers/dashboard.controller");
userRoutes.post('/send-otp', user_controller_1.sendOtp);
userRoutes.post('/otp-verify', user_controller_1.OTPVerify);
userRoutes.post('/registration', user_controller_1.userRegistration);
userRoutes.post('/login', user_controller_1.userLogin);
userRoutes.post('/social-login', user_controller_1.userSocialLoginByApp);
userRoutes.post('/web-login', user_controller_1.userLoginFromWebsite);
userRoutes.post('/social-login-web', user_controller_1.userSocialLogin);
userRoutes.post('/send-reset-otp', user_controller_1.sendPasswordResetOtp);
userRoutes.post('/verify-reset-otp', user_controller_1.otpVerifyForResetPassword);
userRoutes.post('/reset-password', user_controller_1.changePasswordForOtpRequest);
userRoutes.post('/password-update', (0, auth_1.userAuth)({ isAuth: true }), auth_1.isDemoRequest, user_controller_1.passwordResetByToken);
userRoutes.delete('/account-deactivate', (0, auth_1.userAuth)({ isAuth: true }), auth_1.isDemoRequest, user_controller_1.accountTemporaryDeactivate);
userRoutes.post('/resend-otp-verify', user_controller_1.resendOTPVerify);
userRoutes.post('/update-by-token', (0, auth_1.userAuth)({ isAuth: true }), auth_1.isDemoRequest, user_controller_1.userUpdateByToken);
userRoutes.get('/verify', (0, auth_1.userAuth)({ isAuth: true }), user_controller_1.getLoginUserDataByToken);
userRoutes.get('/verify-by-email-phone', user_controller_1.userVerifyByEmailOrPhone);
userRoutes.post('/update-by-admin', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, user_controller_1.userUpdateByAdmin);
userRoutes.post('/password-update-by-admin', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, user_controller_1.passwordUpdateByAdmin);
userRoutes.get('/list', (0, auth_1.userAuth)({ isAdmin: true }), user_controller_1.userList);
userRoutes.get('/details', (0, auth_1.userAuth)({ isAdmin: true }), user_controller_1.userDetails);
userRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, user_controller_1.deleteUser);
// fetchDriverDetails
userRoutes.get('/driver/list', (0, auth_1.userAuth)({ isAdmin: true }), user_controller_1.fetchDrivers);
userRoutes.get('/driver/details', (0, auth_1.userAuth)({ isAdmin: true }), user_controller_1.fetchDriverDetails);
userRoutes.get('/driver-payment-accept-list', user_controller_1.getDriverPaymentAcceptList);
userRoutes.get('/driver-balance-info', (0, auth_1.userAuth)({ isDriver: true }), user_controller_1.getDriverBalanceInfo);
// employee
userRoutes.post('/employee-create', (0, auth_1.userAuth)({ isAdmin: true }), user_controller_1.employeeCreate);
userRoutes.get('/employee-list', user_controller_1.employeeList);
userRoutes.get('/filtering-employees', user_controller_1.filteringEmployeeList);
// email send
userRoutes.post('/group-email-send', user_controller_1.groupEmailSend);
// dashboard
userRoutes.get('/driver/dashboard', (0, auth_1.userAuth)({ isDriver: true }), dashboard_controller_1.getDriverDashBoardInfo);
userRoutes.get('/admin/dashboard', (0, auth_1.userAuth)({ isAuth: true }), dashboard_controller_1.getAdminDashBoardInfo);
userRoutes.get('/dashboard', (0, auth_1.userAuth)({ isUser: true }), dashboard_controller_1.getUserDashBoardInfo);
exports.default = userRoutes;
//# sourceMappingURL=user.routes.js.map