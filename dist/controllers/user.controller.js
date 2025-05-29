"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverBalanceInfo = exports.getDriverPaymentAcceptList = exports.groupEmailSend = exports.employeeElement = exports.filteringEmployeeList = exports.employeeList = exports.employeeCreate = exports.fetchDriverDetails = exports.userDetails = exports.userList = exports.deleteUser = exports.fetchDrivers = exports.userVerifyByEmailOrPhone = exports.getLoginUserDataByToken = exports.resendOTPVerify = exports.sendOtp = exports.userUpdateByAdmin = exports.userUpdateByToken = exports.accountTemporaryDeactivate = exports.passwordUpdateByAdmin = exports.passwordResetByToken = exports.changePasswordForOtpRequest = exports.otpVerifyForResetPassword = exports.sendPasswordResetOtp = exports.userSocialLoginByApp = exports.userSocialLogin = exports.userLoginFromWebsite = exports.userLogin = exports.OTPVerify = exports.userRegistration = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const otp_model_1 = __importDefault(require("../models/otp.model"));
const common_1 = require("../utils/common");
const mongoose_1 = __importDefault(require("mongoose"));
const role_model_1 = __importDefault(require("../models/role.model"));
const userEmailSend_1 = require("../utils/userEmailSend");
const payment_model_1 = __importDefault(require("../models/payment.model"));
const driver_balance_model_1 = __importDefault(require("../models/driver_balance.model"));
const driver_rating_model_1 = __importDefault(require("../models/driver_rating.model"));
const auth_1 = require("firebase-admin/auth");
const firebase_1 = __importDefault(require("../utils/firebase"));
const secret = process.env.JWT_SECRET;
// user signup
const userRegistration = async (req, res, next) => {
    try {
        let { body } = req;
        // @ts-ignore
        const { phone = '' } = body?.token ? await jsonwebtoken_1.default.verify(body?.token, secret) : {};
        if (!phone) {
            return res.status(400).send({
                error: true,
                msg: 'Invalid input'
            });
        }
        const exitUser = await user_model_1.default.findOne({
            $or: [
                { email: body.email },
                { phone: phone },
            ]
        });
        if (!!exitUser) {
            return res.status(400).send({
                error: true,
                msg: 'An account with this credential has already existed',
            });
        }
        let hashedPassword;
        if (body.password) {
            hashedPassword = await bcrypt_1.default.hash(body.password, 8);
        }
        let user = new user_model_1.default({
            first_name: body.first_name,
            middle_name: body.middle_name,
            last_name: body.last_name,
            name: body.name,
            username: body.username,
            email: body.email,
            phone,
            gender: body.gender,
            password: hashedPassword,
            role: body.role,
            verified: true
        });
        await user.save();
        await user_model_1.default.findByIdAndUpdate(user?._id, { $addToSet: { fcm_token: body.fcm_token } });
        let token = jsonwebtoken_1.default.sign({ _id: user?._id }, secret, { expiresIn: '15 days' });
        return res.status(200).send({
            error: false,
            data: {
                token
            }
        });
    }
    catch (e) {
        if (e?.code === 11000) {
            return res.status(406).send({
                error: true,
                msg: 'An account with this credential has already existed',
            });
        }
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.userRegistration = userRegistration;
// user opt verification
const OTPVerify = async (req, res) => {
    try {
        const { body } = req;
        let otp = await otp_model_1.default.findOne({ phone: body.phone, action: 'registration' });
        if (!!otp && otp?.attempts > 0 && body.otp === otp?.code) {
            let token = jsonwebtoken_1.default.sign({ phone: body.phone }, secret, { expiresIn: '30m' });
            return res.status(200).send({
                error: false,
                msg: 'otp verified',
                token,
            });
        }
        if (otp) {
            otp.attempts -= 1;
            await otp.save();
        }
        return res.status(401).send({
            error: true,
            msg: 'Invalid/Expired otp'
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.OTPVerify = OTPVerify;
// user login
const userLogin = async (req, res) => {
    try {
        let { body } = req;
        if (body.username && body.password) {
            const email = body?.username?.trim().toLowerCase();
            const user = await user_model_1.default.findOne({ $or: [{ email }, { phone: body.username }] })
                .populate('vehicle', "approved active");
            if (user?.verified === false) {
                return res.status(403).json({
                    error: true,
                    msg: 'Please verify your phone first',
                    data: {
                        phone: user?.phone,
                        verified: user?.verified
                    }
                });
            }
            if (!user?.password) {
                return res.status(403).json({
                    error: true,
                    msg: 'Wrong credential',
                });
            }
            if (user) {
                let auth = await bcrypt_1.default.compare(body.password, user.password);
                if (auth) {
                    user.password = undefined;
                    await user_model_1.default.findByIdAndUpdate(user?._id, { $addToSet: { fcm_token: body.fcm_token } });
                    let token = await jsonwebtoken_1.default.sign({ _id: user._id }, secret, { expiresIn: '48h' });
                    // @ts-ignore
                    if (user.role === 'driver') {
                        console.log(user);
                        // @ts-ignore
                        if (user?.vehicle?.approved === true) {
                            const driverInfo = await driver_rating_model_1.default.aggregate([
                                {
                                    $match: {
                                        driver: new mongoose_1.default.Types.ObjectId(user._id)
                                    }
                                },
                                {
                                    $group: {
                                        _id: null,
                                        rating: { $sum: "$rating" },
                                        count: { $count: {} }
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        total_review: 1,
                                        average_rating: { $divide: ["$rating", "$count"] }
                                    }
                                }
                            ]);
                            return res.status(200).send({
                                error: false,
                                msg: 'Login successful',
                                token,
                                data: {
                                    _id: user?._id,
                                    name: user?.name,
                                    email: user?.email,
                                    phone: user?.phone,
                                    rating: driverInfo[0],
                                    role: user?.role,
                                    verified: user?.verified,
                                    vehicle: user?.vehicle,
                                }
                            });
                        }
                        return res.status(500).send({
                            error: true,
                            msg: "Your document has not verified yet from the admin",
                            data: { role: user?.role, token }
                        });
                    }
                    return res.status(200).send({
                        error: false,
                        msg: 'Login successful',
                        token,
                        data: {
                            _id: user?._id,
                            name: user?.name,
                            email: user?.email,
                            phone: user?.phone,
                            role: user?.role,
                            verified: user?.verified,
                            vehicle: user?.vehicle,
                        }
                    });
                }
                else {
                    return res.status(401).send({
                        error: true,
                        msg: 'Invalid credentials'
                    });
                }
            }
            return res.status(404).json({
                error: true,
                msg: 'User not found'
            });
        }
        return res.status(404).json({
            error: true,
            msg: 'Wrong Credentials'
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.userLogin = userLogin;
// user login
const userLoginFromWebsite = async (req, res) => {
    try {
        let { body } = req;
        if (body.username && body.password) {
            const email = body?.username?.trim().toLowerCase();
            const user = await user_model_1.default.findOne({ $or: [{ email }, { phone: body.username }] })
                .populate('vehicle', "approved active");
            if (user?.verified === false) {
                return res.status(403).json({
                    error: true,
                    msg: 'Please verify your phone first',
                    data: {
                        phone: user?.phone,
                        verified: user?.verified
                    }
                });
            }
            if (!user?.password) {
                return res.status(403).json({
                    error: true,
                    msg: 'Wrong credential',
                });
            }
            if (user) {
                let auth = await bcrypt_1.default.compare(body.password, user.password);
                if (auth) {
                    user.password = undefined;
                    await user_model_1.default.findByIdAndUpdate(user?._id, { $addToSet: { fcm_token: body.fcm_token } });
                    let token = await jsonwebtoken_1.default.sign({ _id: user._id }, secret, { expiresIn: '48h' });
                    if (user.role === 'driver') {
                        const driverInfo = await driver_rating_model_1.default.aggregate([
                            {
                                $match: {
                                    driver: new mongoose_1.default.Types.ObjectId(user._id)
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    rating: { $sum: "$rating" },
                                    count: { $count: {} }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    total_review: 1,
                                    average_rating: { $divide: ["$rating", "$count"] }
                                }
                            }
                        ]);
                        return res.status(200).send({
                            error: false,
                            msg: 'Login successful',
                            token,
                            data: {
                                _id: user?._id,
                                name: user?.name,
                                email: user?.email,
                                phone: user?.phone,
                                rating: driverInfo[0],
                                role: user?.role,
                                verified: user?.verified,
                                vehicle: user?.vehicle,
                            }
                        });
                    }
                    return res.status(200).send({
                        error: false,
                        msg: 'Login successful',
                        token,
                        data: {
                            _id: user?._id,
                            name: user?.name,
                            email: user?.email,
                            phone: user?.phone,
                            role: user?.role,
                            verified: user?.verified,
                        }
                    });
                }
                else {
                    return res.status(401).send({
                        error: true,
                        msg: 'Invalid credentials'
                    });
                }
            }
            return res.status(404).json({
                error: true,
                msg: 'User not found'
            });
        }
        return res.status(404).json({
            error: true,
            msg: 'Wrong Credentials'
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.userLoginFromWebsite = userLoginFromWebsite;
const userSocialLogin = async (req, res) => {
    try {
        let { body } = req;
        let decodedToken = await (0, auth_1.getAuth)(firebase_1.default).verifyIdToken(body?.idToken);
        let user = await user_model_1.default.findOne({ email: decodedToken?.email }).populate('vehicle', "approved active");
        if (!user) {
            user = new user_model_1.default({
                name: decodedToken.name,
                email: decodedToken.email?.toLowerCase(),
                image: decodedToken.picture,
                role: body.role,
                verified: true
            });
            await user.save();
        }
        let token = jsonwebtoken_1.default.sign({ _id: user?._id }, secret, { expiresIn: '8h' });
        await user_model_1.default.findByIdAndUpdate(user?._id, { $addToSet: { fcm_token: body.fcm_token } });
        if (user?.role === 'driver') {
            const driverInfo = await driver_rating_model_1.default.aggregate([
                {
                    $match: {
                        driver: new mongoose_1.default.Types.ObjectId(user._id)
                    }
                },
                {
                    $group: {
                        _id: null,
                        rating: { $sum: "$rating" },
                        count: { $count: {} }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total_review: 1,
                        average_rating: { $divide: ["$rating", "$count"] }
                    }
                }
            ]);
            return res.status(200).send({
                error: false,
                msg: 'Login successful',
                token,
                data: {
                    _id: user?._id,
                    name: user?.name,
                    email: user?.email,
                    phone: user?.phone,
                    rating: driverInfo[0],
                    role: user?.role,
                    verified: user?.verified,
                    vehicle: user?.vehicle,
                    auth_type: body.auth_type
                }
            });
        }
        return res.status(200).send({
            error: false,
            msg: 'Login successful',
            token,
            data: {
                _id: user?._id,
                name: user?.name,
                email: user?.email,
                phone: user?.phone,
                role: user?.role,
                verified: user?.verified,
                auth_type: body.auth_type
            }
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Login failed! Try again'
        });
    }
};
exports.userSocialLogin = userSocialLogin;
const userSocialLoginByApp = async (req, res) => {
    try {
        let { body } = req;
        let decodedToken = await (0, auth_1.getAuth)(firebase_1.default).verifyIdToken(body?.idToken);
        let user = await user_model_1.default.findOne({ email: decodedToken?.email }).populate('vehicle', "approved active");
        if (!user) {
            user = new user_model_1.default({
                name: decodedToken.name,
                email: decodedToken.email?.toLowerCase(),
                image: decodedToken.picture,
                role: body.role,
                verified: true
            });
            await user.save();
        }
        let token = jsonwebtoken_1.default.sign({ _id: user?._id }, secret, { expiresIn: '8h' });
        await user_model_1.default.findByIdAndUpdate(user?._id, { $addToSet: { fcm_token: body.fcm_token } });
        if (user?.role === 'driver') {
            // @ts-ignore
            if (user?.vehicle?.approved === true) {
                const driverInfo = await driver_rating_model_1.default.aggregate([
                    {
                        $match: {
                            driver: new mongoose_1.default.Types.ObjectId(user._id)
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            rating: { $sum: "$rating" },
                            count: { $count: {} }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            total_review: 1,
                            average_rating: { $divide: ["$rating", "$count"] }
                        }
                    }
                ]);
                return res.status(200).send({
                    error: false,
                    msg: 'Login successful',
                    token,
                    data: {
                        _id: user?._id,
                        name: user?.name,
                        email: user?.email,
                        phone: user?.phone,
                        rating: driverInfo[0],
                        role: user?.role,
                        verified: user?.verified,
                        vehicle: user?.vehicle,
                        auth_type: body.auth_type
                    }
                });
            }
            return res.status(500).send({
                error: true,
                msg: "Your document has not verified yet from the admin",
                data: { role: user?.role, token, auth_type: body.auth_type }
            });
        }
        return res.status(200).send({
            error: false,
            msg: 'Login successful',
            token,
            data: {
                _id: user?._id,
                name: user?.name,
                email: user?.email,
                phone: user?.phone,
                role: user?.role,
                verified: user?.verified,
                auth_type: body.auth_type
            }
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Login failed! Try again'
        });
    }
};
exports.userSocialLoginByApp = userSocialLoginByApp;
/*
 * Password reset
 * */
const sendPasswordResetOtp = async (req, res) => {
    try {
        let { body } = req;
        let user = await user_model_1.default.findOne({ phone: body.phone });
        if (!user) {
            return res.status(404).send({
                error: true,
                msg: 'User Not Found'
            });
        }
        let otp = await otp_model_1.default.findOne({ phone: body.phone, action: 'password_reset' });
        if (!!otp) {
            return res.status(401).send({
                error: true,
                msg: 'Already send. Please try again later after 2min'
            });
        }
        let code = (0, common_1.generateOTP)();
        const otp_msg = `Your verification OTP code ${code}`;
        // await sendTwilioSMS(body.phone, otp_msg)
        await otp_model_1.default.create({
            phone: body.phone,
            code,
            action: 'password_reset'
        });
        return res.status(200).send({
            error: false,
            msg: 'Otp sent',
            data: {
                otp: process.env.PRODUCT_MODE === 'demo' && code,
                phone: body.phone
            }
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.sendPasswordResetOtp = sendPasswordResetOtp;
const otpVerifyForResetPassword = async (req, res) => {
    try {
        const { body } = req;
        let otp = await otp_model_1.default.findOne({ phone: body.phone, action: 'password_reset' });
        if (!!otp && otp?.attempts > 0 && body.otp === otp?.code) {
            let user = await user_model_1.default.findOne({ phone: body.phone }, 'first_name middle_name last_name phone email');
            if (!user) {
                return res.status(404).send({
                    error: true,
                    msg: 'User Not Found'
                });
            }
            let token = jsonwebtoken_1.default.sign({ _id: user._id }, secret, { expiresIn: '10m' });
            return res.status(200).send({
                error: false,
                msg: 'Successfully verified',
                token
            });
        }
        if (otp) {
            otp.attempts -= 1;
            await otp.save();
        }
        return res.status(401).send({
            error: true,
            msg: 'Invalid/Expired otp'
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.otpVerifyForResetPassword = otpVerifyForResetPassword;
const changePasswordForOtpRequest = async (req, res) => {
    try {
        let { _id } = res.locals.user || {};
        const { body } = req;
        let user = await user_model_1.default.findById(_id, 'password');
        if (!!user) {
            if (body.password === body.confirmPassword) {
                const hashedPassword = await bcrypt_1.default.hash(body.password, 8);
                await user_model_1.default.updateOne({ _id: user._id }, { password: hashedPassword });
                return res.status(200).send({
                    error: false,
                    msg: 'Successfully updated',
                });
            }
            return res.status(400).send({
                error: false,
                msg: 'Wrong Input',
            });
        }
        else {
            return res.status(401).send({
                error: true,
                msg: 'Unauthorized action'
            });
        }
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.changePasswordForOtpRequest = changePasswordForOtpRequest;
const passwordResetByToken = async (req, res) => {
    try {
        let { _id } = res.locals.user || {};
        const { body } = req;
        let user = await user_model_1.default.findById(_id, 'password');
        if (!!user && body?.currentPassword) {
            const isMatched = await bcrypt_1.default.compare(body.currentPassword, user.password);
            if (isMatched) {
                const hashedPassword = await bcrypt_1.default.hash(body.password, 8);
                await user_model_1.default.updateOne({ _id: user._id }, { password: hashedPassword });
                return res.status(200).send({
                    error: false,
                    msg: 'Successfully updated',
                });
            }
            else {
                return res.status(400).send({
                    error: true,
                    msg: 'Wrong Input',
                });
            }
        }
        else {
            return res.status(401).send({
                error: true,
                msg: 'Unauthorized action'
            });
        }
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.passwordResetByToken = passwordResetByToken;
const passwordUpdateByAdmin = async (req, res) => {
    try {
        let { user } = res.locals;
        const { body } = req;
        if (user?.role === "admin" && !!body?.password && !!body?.confirmPassword) {
            const hashedPassword = await bcrypt_1.default.hash(body.password, 8);
            await user_model_1.default.updateOne({ _id: body?._id }, { password: hashedPassword });
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated',
            });
        }
        else {
            return res.status(400).send({
                error: true,
                msg: 'Wrong Action',
            });
        }
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.passwordUpdateByAdmin = passwordUpdateByAdmin;
const accountTemporaryDeactivate = async (req, res) => {
    try {
        let { user } = res.locals;
        const { body } = req;
        if (user?._id) {
            await user_model_1.default.updateOne({ _id: user._id }, { $set: { verified: false } });
            return res.status(200).send({
                error: false,
                msg: 'Temporary deactivate successful',
            });
        }
        else {
            return res.status(200).send({
                error: false,
                msg: 'Authentication failed',
            });
        }
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.accountTemporaryDeactivate = accountTemporaryDeactivate;
const userUpdateByToken = async (req, res) => {
    try {
        let { _id } = res.locals.user || {};
        const { body } = req;
        let user = await user_model_1.default.findById(_id);
        if (!!user) {
            delete body.password;
            await user_model_1.default.updateOne({ _id: user._id }, { $set: { ...body } });
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated',
            });
        }
        else {
            return res.status(401).send({
                error: true,
                msg: 'Unauthorized action'
            });
        }
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.userUpdateByToken = userUpdateByToken;
const userUpdateByAdmin = async (req, res) => {
    try {
        const { body } = req;
        let isUser = await user_model_1.default.findById(body?._id);
        if (!!isUser) {
            delete body.password;
            await user_model_1.default.updateOne({ _id: body?._id }, { $set: body });
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated',
            });
        }
        else {
            return res.status(401).send({
                error: true,
                msg: 'User not found'
            });
        }
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.userUpdateByAdmin = userUpdateByAdmin;
const sendOtp = async (req, res) => {
    try {
        let { body } = req;
        let otp = await otp_model_1.default.findOne({ phone: body.phone, action: 'registration' });
        if (!!otp) {
            return res.status(401).send({
                error: true,
                msg: 'Already send. Please try again later after 2min'
            });
        }
        let code = (0, common_1.generateOTP)();
        const otp_msg = `Your verification OTP code ${code}`;
        // await sendTwilioSMS(body.phone, otp_msg)
        await otp_model_1.default.create({
            phone: body.phone,
            code,
            action: 'registration'
        });
        return res.status(200).send({
            error: false,
            msg: 'Otp sent',
            data: {
                otp: process.env.PRODUCT_MODE === 'demo' && code,
                phone: body.phone
            }
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.sendOtp = sendOtp;
const resendOTPVerify = async (req, res) => {
    try {
        const { body } = req;
        let otp = await otp_model_1.default.findOne({ phone: body.phone, action: body.action });
        if (!!otp && otp?.attempts > 0 && body.otp === otp?.code) {
            let user = await user_model_1.default.findOne({ phone: body.phone }, 'first_name middle_name last_name phone email');
            if (!user) {
                return res.status(404).send({
                    error: true,
                    msg: 'User Not Found'
                });
            }
            await user_model_1.default.updateOne({ _id: user._id }, { verified: true });
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated',
            });
        }
        if (otp) {
            otp.attempts -= 1;
            await otp.save();
        }
        return res.status(401).send({
            error: true,
            msg: 'Invalid/Expired otp'
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.resendOTPVerify = resendOTPVerify;
const getLoginUserDataByToken = async (req, res, next) => {
    try {
        const { user } = res.locals;
        if (!user?._id) {
            return res.status(403).json({
                error: true,
                msg: "Permission denied"
            });
        }
        const userInfo = await user_model_1.default.aggregate([
            {
                $match: { _id: new mongoose_1.default.Types.ObjectId(user?._id) }
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'permission',
                    foreignField: '_id',
                    as: 'permission'
                }
            },
            {
                $lookup: {
                    from: 'vehicles',
                    let: { "id": '$vehicle' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$id"] }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                model_name: 1,
                                images: 1,
                                approved: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                active: 1
                            }
                        }
                    ],
                    as: 'vehicle'
                }
            },
            { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    password: 0,
                    ticket_departments: 0,
                    ticket_categories: 0,
                    ticket_types: 0,
                    active: 0,
                    fcm_token: 0,
                    __v: 0,
                    assigned_ticket: 0,
                }
            }
        ]);
        if (!user) {
            return res.status(400).json({
                error: true,
                msg: "Not Found"
            });
        }
        return res.status(200).json({
            error: false,
            data: userInfo[0]
        });
    }
    catch (e) {
        return res.status(200).json({
            error: true,
            data: "Server side error"
        });
    }
};
exports.getLoginUserDataByToken = getLoginUserDataByToken;
const userVerifyByEmailOrPhone = async (req, res, next) => {
    try {
        const { query } = req;
        // @ts-ignore
        const isExit = await user_model_1.default.findOne({ $or: [{ email: query?.username?.toLowerCase() }, { phone: query?.username }] });
        if (!isExit) {
            return res.status(403).json({
                error: true,
                data: "Please signup first"
            });
        }
        return res.status(200).json({
            error: false,
            data: "login success"
        });
    }
    catch (e) {
        return res.status(200).json({
            error: true,
            data: "Server side error"
        });
    }
};
exports.userVerifyByEmailOrPhone = userVerifyByEmailOrPhone;
/**
 *
 * Driver
 *
 * **/
const fetchDrivers = async (req, res) => {
    try {
        const { query } = req;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    { "name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        let data = await user_model_1.default.aggregatePaginate(user_model_1.default.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            {
                $match: {
                    role: "driver"
                }
            },
            {
                $lookup: {
                    from: "vehicles",
                    let: { 'driver': "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$driver", "$$driver"]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                images: 1,
                                model_name: 1,
                                approved: 1,
                                createdAt: 1
                            }
                        }
                    ],
                    as: 'vehicle'
                }
            },
            { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1,
                    image: 1,
                    email: 1,
                    phone: 1,
                    updatedAt: 1,
                    createdAt: 1,
                    verified: 1,
                    role: 1,
                    vehicle: 1
                }
            },
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
            sort: { createdAt: -1 },
        });
        return res.status(200).send({
            error: false,
            msg: 'Success',
            data
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.fetchDrivers = fetchDrivers;
const deleteUser = async (req, res) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        if (user?.role === 'admin') {
            await user_model_1.default.deleteOne({ _id: query?._id });
            return res.status(200).json({
                error: false,
                data: 'Deleted Successful'
            });
        }
        else {
            return res.status(200).json({
                error: false,
                data: 'Permission denied'
            });
        }
    }
    catch (e) {
        return res.status(200).json({
            error: true,
            data: e.message
        });
    }
};
exports.deleteUser = deleteUser;
const userList = async (req, res) => {
    try {
        const { query } = req;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    { "name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        let data = await user_model_1.default.aggregatePaginate(user_model_1.default.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            {
                $match: {
                    role: "user"
                }
            },
            {
                $project: {
                    name: 1,
                    image: 1,
                    email: 1,
                    phone: 1,
                    updatedAt: 1,
                    createdAt: 1,
                    verified: 1,
                    role: 1,
                }
            },
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
            sort: { createdAt: -1 },
        });
        return res.status(200).send({
            error: false,
            msg: 'Success',
            data
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.userList = userList;
const userDetails = async (req, res) => {
    try {
        const { query } = req;
        // @ts-ignore
        let data = await user_model_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(query._id),
                    role: "user"
                }
            },
            {
                $project: {
                    password: 0
                }
            },
        ]);
        return res.status(200).send({
            error: false,
            msg: 'Success',
            data: data[0]
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.userDetails = userDetails;
const fetchDriverDetails = async (req, res) => {
    try {
        const { query } = req;
        // @ts-ignore
        const drivers = await user_model_1.default.aggregatePaginate(user_model_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(query?._id)
                }
            },
            {
                $lookup: {
                    from: 'vehicles',
                    let: { 'driver': '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$driver', '$$driver'] }
                            }
                        },
                        {
                            $lookup: {
                                from: 'service_categories',
                                let: { 'service_category': '$service_category' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$_id', '$$service_category'] }
                                        }
                                    },
                                    {
                                        $project: {
                                            name: 1,
                                            image: 1
                                        }
                                    }
                                ],
                                as: 'categories'
                            }
                        },
                        { $unwind: { path: "$categories", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'services',
                                let: { 'service': '$service' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$_id', '$$service'] }
                                        }
                                    },
                                    {
                                        $project: {
                                            name: 1,
                                            image: 1
                                        }
                                    }
                                ],
                                as: 'service'
                            }
                        },
                        { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
                    ],
                    as: 'vehicle'
                }
            },
            { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    fcm_token: 0,
                    assigned_ticket: 0,
                    push_notification_status: 0,
                    ticket_categories: 0,
                    ticket_departments: 0,
                    ticket_types: 0,
                }
            }
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        if (!drivers) {
            return res.status(400).json({
                error: true,
                msg: "Not Found"
            });
        }
        return res.status(200).json({
            error: false,
            data: !!query._id ? drivers?.docs[0] : drivers
        });
    }
    catch (e) {
        return res.status(200).json({
            error: true,
            data: e.message
        });
    }
};
exports.fetchDriverDetails = fetchDriverDetails;
/**
 * employee
 */
const employeeCreate = async (req, res) => {
    try {
        const { user: admin } = res.locals;
        let { body } = req;
        let hashedPassword;
        if (body.password) {
            hashedPassword = await bcrypt_1.default.hash(body.password, 8);
        }
        if (!!body._id) {
            await user_model_1.default.updateOne({ _id: body._id }, { ...body, password: hashedPassword });
            return res.status(200).send({
                error: false,
                msg: 'Updated Successful',
            });
        }
        else {
            const isUser = await user_model_1.default.findOne({
                $or: [
                    { email: body.email },
                    { phone: body.phone },
                ]
            });
            if (!!isUser) {
                return res.status(400).send({
                    error: true,
                    msg: 'An account with this credential has already existed',
                });
            }
            const randomNumberGen = await (0, common_1.numberGen)(6);
            let user = new user_model_1.default({
                name: body.name,
                email: body.email,
                phone: body.phone,
                password: hashedPassword,
                role: body.role,
                joining_date: body.joining_date,
                department: body.department,
                permission: body.permission,
                key: randomNumberGen,
                verified: true,
                ticket_departments: body.ticket_departments,
                ticket_categories: body.ticket_categories,
                ticket_types: body.ticket_types,
            });
            await user.save();
            return res.status(200).send({
                error: false,
                msg: 'Successfully employee created'
            });
        }
    }
    catch (e) {
        return res.status(200).json({
            error: true,
            data: "Server failed"
        });
    }
};
exports.employeeCreate = employeeCreate;
const employeeList = async (req, res) => {
    try {
        const { query } = req;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    { "name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "key": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "department.name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "ticket_departments.name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "ticket_categories.name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const employees = await user_model_1.default.aggregatePaginate(user_model_1.default.aggregate([
            {
                $match: {
                    role: 'employee'
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'permission',
                    foreignField: '_id',
                    as: 'permission'
                }
            },
            { $unwind: { path: "$permission", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'ticket_departments',
                    let: { "ticket_departments": "$ticket_departments" },
                    pipeline: [
                        {
                            $match: { $expr: { $in: ["$_id", "$$ticket_departments"] } }
                        },
                        {
                            $project: {
                                name: 1,
                                active: 1
                            }
                        }
                    ],
                    as: 'ticket_departments'
                }
            },
            { $unwind: { path: "$ticket_departments", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'ticket_departments',
                    let: { "ticket_categories": "$ticket_categories" },
                    pipeline: [
                        {
                            $match: { $expr: { $in: ["$parent", "$$ticket_categories"] } }
                        },
                        {
                            $project: {
                                name: 1,
                                active: 1
                            }
                        }
                    ],
                    as: 'ticket_categories'
                }
            },
            { $unwind: { path: "$ticket_categories", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    password: 0
                }
            },
            { $match: filter }
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: employees
        });
    }
    catch (e) {
        return res.status(200).json({
            error: true,
            data: e.message
        });
    }
};
exports.employeeList = employeeList;
const filteringEmployeeList = async (req, res) => {
    try {
        const { query } = req;
        // @ts-ignore
        const employees = await user_model_1.default.aggregatePaginate(user_model_1.default.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ['$role', 'employee'] },
                            { $eq: ['$department', new mongoose_1.default.Types.ObjectId(query.department)] },
                            { $eq: ['$permission', new mongoose_1.default.Types.ObjectId(query.role)] },
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'permission',
                    foreignField: '_id',
                    as: 'permission'
                }
            },
            { $unwind: { path: "$permission", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    password: 0
                }
            }
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: employees
        });
    }
    catch (e) {
        return res.status(200).json({
            error: true,
            data: e.message
        });
    }
};
exports.filteringEmployeeList = filteringEmployeeList;
const employeeElement = async () => {
    try {
        let employeeRoles = await role_model_1.default.find({}).select('name');
        let arr = [];
        for (let i = 0; i < employeeRoles.length; i++) {
            if (employeeRoles[i].name === 'user' ||
                employeeRoles[i].name === 'super_admin' ||
                employeeRoles[i].name === 'admin' ||
                employeeRoles[i].name === 'site_admin') {
                continue;
            }
            arr.push(employeeRoles[i]);
        }
        return arr;
    }
    catch (error) {
        return [];
    }
};
exports.employeeElement = employeeElement;
// group email, sms send
const groupEmailSend = async (req, res) => {
    try {
        const { body } = req;
        const data = {
            email: body.email,
            subject: body.subject,
            message: body.message
        };
        await (0, userEmailSend_1.sendUserEmailGeneral)(data);
        return res.status(500).json({
            error: true,
            data: 'Email sent successfully'
        });
    }
    catch (e) {
        return res.status(500).json({
            error: true,
            data: e.message
        });
    }
};
exports.groupEmailSend = groupEmailSend;
/**
 * Driver balance
 * */
const getDriverPaymentAcceptList = async (req, res) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        let filter = {};
        // @ts-ignore
        const balance = await payment_model_1.default.aggregatePaginate(payment_model_1.default.aggregate([
            {
                $match: {
                    driver: new mongoose_1.default.Types.ObjectId(user._id),
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { 'user': '$user' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$user']
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                phone: 1,
                                image: 1,
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'trip_requests',
                    let: { 'trip': '$trip' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$trip']
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                pickupLocation: 1,
                                dropLocation: 1,
                                distance: 1,
                                date: 1,
                                time: 1,
                                fare_amount: 1,
                                paid: {
                                    $reduce: {
                                        input: "$payments",
                                        initialValue: 0,
                                        in: {
                                            $add: ["$$value", "$$this.amount"]
                                        }
                                    }
                                },
                            }
                        }
                    ],
                    as: 'trip'
                }
            },
            { $unwind: { path: '$trip', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    user: 1,
                    trip: 1,
                    amount: 1,
                    payment_method: 1,
                    tran_id: 1,
                    tran_date: 1,
                    createdAt: 1,
                    fare_amount: 1,
                    updatedAt: 1,
                }
            },
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: balance
        });
    }
    catch (e) {
        return res.status(500).json({
            error: true,
            data: "Internal Server error"
        });
    }
};
exports.getDriverPaymentAcceptList = getDriverPaymentAcceptList;
const getDriverBalanceInfo = async (req, res) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        // @ts-ignore
        const balance = await driver_balance_model_1.default.aggregate([
            {
                $match: {
                    driver: new mongoose_1.default.Types.ObjectId(user?._id),
                }
            },
            {
                $group: {
                    _id: null,
                    amount: { $sum: "$amount" },
                    driver: { $first: '$driver' }
                }
            },
            {
                $lookup: {
                    from: 'withdraws',
                    let: { 'driver': '$driver' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$by", "$$driver"] },
                                        { $eq: ["$approved", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: '$amount' },
                                by: { $first: '$by' }
                            }
                        }
                    ],
                    as: 'withdraw'
                }
            },
            { $unwind: { path: '$withdraw', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    total_earning: { $trunc: [{ $ifNull: ["$amount", 0] }, 2] },
                    total_withdraw: { $trunc: [{ $ifNull: ["$withdraw.amount", 0] }, 2] },
                    remaining_balance: { $trunc: [{ $ifNull: [{ $subtract: ["$amount", "$withdraw.amount"] }, "$amount"] }, 2] },
                }
            }
        ]);
        return res.status(200).json({
            error: false,
            data: balance
        });
    }
    catch (e) {
        return res.status(500).json({
            error: true,
            data: "Internal Server error"
        });
    }
};
exports.getDriverBalanceInfo = getDriverBalanceInfo;
//# sourceMappingURL=user.controller.js.map