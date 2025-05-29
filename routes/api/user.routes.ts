import {Router} from 'express';

const userRoutes = Router();

import {isDemoRequest, userAuth,} from '../../auth';
import {
    userRegistration,
    userLogin,
    OTPVerify,
    sendPasswordResetOtp,
    otpVerifyForResetPassword,
    passwordResetByToken,
    userUpdateByToken,
    sendOtp,
    resendOTPVerify,
    getLoginUserDataByToken,
    fetchDrivers,
    deleteUser,
    fetchDriverDetails,
    changePasswordForOtpRequest,
    employeeCreate,
    employeeList,
    filteringEmployeeList,
    groupEmailSend,
    getDriverBalanceInfo,
    getDriverPaymentAcceptList,
    accountTemporaryDeactivate,
    userList,
    userDetails,
    userUpdateByAdmin,
    passwordUpdateByAdmin,
    userLoginFromWebsite,
    userSocialLogin,
    userSocialLoginByApp,
    userVerifyByEmailOrPhone
} from '../../controllers/user.controller'
import {
    getAdminDashBoardInfo,
    getDriverDashBoardInfo,
    getUserDashBoardInfo
} from "../../controllers/dashboard.controller";


userRoutes.post('/send-otp', sendOtp);
userRoutes.post('/otp-verify', OTPVerify);
userRoutes.post('/registration', userRegistration);

userRoutes.post('/login', userLogin);
userRoutes.post('/social-login', userSocialLoginByApp);
userRoutes.post('/web-login', userLoginFromWebsite);
userRoutes.post('/social-login-web', userSocialLogin);

userRoutes.post('/send-reset-otp', sendPasswordResetOtp);
userRoutes.post('/verify-reset-otp', otpVerifyForResetPassword);
userRoutes.post('/reset-password', changePasswordForOtpRequest);
userRoutes.post('/password-update', userAuth({isAuth: true}), isDemoRequest, passwordResetByToken);
userRoutes.delete('/account-deactivate', userAuth({isAuth: true}), isDemoRequest, accountTemporaryDeactivate);

userRoutes.post('/resend-otp-verify', resendOTPVerify);

userRoutes.post('/update-by-token', userAuth({isAuth: true}), isDemoRequest, userUpdateByToken);
userRoutes.get('/verify', userAuth({isAuth: true}), getLoginUserDataByToken)
userRoutes.get('/verify-by-email-phone', userVerifyByEmailOrPhone)
userRoutes.post('/update-by-admin', userAuth({isAdmin: true}), isDemoRequest, userUpdateByAdmin);
userRoutes.post('/password-update-by-admin', userAuth({isAdmin: true}), isDemoRequest, passwordUpdateByAdmin);
userRoutes.get('/list', userAuth({isAdmin: true}), userList)
userRoutes.get('/details', userAuth({isAdmin: true}), userDetails)
userRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, deleteUser);

// fetchDriverDetails
userRoutes.get('/driver/list', userAuth({isAdmin: true}), fetchDrivers);
userRoutes.get('/driver/details', userAuth({isAdmin: true}), fetchDriverDetails);
userRoutes.get('/driver-payment-accept-list', getDriverPaymentAcceptList);
userRoutes.get('/driver-balance-info', userAuth({isDriver: true}), getDriverBalanceInfo);

// employee
userRoutes.post('/employee-create', userAuth({isAdmin: true}), employeeCreate);
userRoutes.get('/employee-list', employeeList);
userRoutes.get('/filtering-employees', filteringEmployeeList);

// email send
userRoutes.post('/group-email-send', groupEmailSend);

// dashboard
userRoutes.get('/driver/dashboard', userAuth({isDriver: true}), getDriverDashBoardInfo);
userRoutes.get('/admin/dashboard', userAuth({isAuth: true}), getAdminDashBoardInfo);
userRoutes.get('/dashboard', userAuth({isUser: true}), getUserDashBoardInfo);


export default userRoutes;

