import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from "../models/user.model";
import OTP from "../models/otp.model";
import {sendTwilioSMS} from '../utils/sms';
import {generateOTP, numberGen} from '../utils/common';
import mongoose from "mongoose";
import Role from "../models/role.model";
import {sendUserEmailGeneral} from "../utils/userEmailSend";
import Payment from "../models/payment.model";
import DriverBalance from "../models/driver_balance.model";
import DriverRating from "../models/driver_rating.model";
import {getAuth} from 'firebase-admin/auth';
import firebaseAdmin from "../utils/firebase";

const secret = process.env.JWT_SECRET;

// user signup
export const userRegistration = async (req, res, next) => {
    try {
        let {body} = req;
        // @ts-ignore
        const {phone = ''} = body?.token ? await jwt.verify(body?.token, secret) : {};
        if (!phone) {
            return res.status(400).send({
                error: true,
                msg: 'Invalid input'
            })
        }
        const exitUser = await User.findOne({
            $or: [
                {email: body.email},
                {phone: phone},
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
            hashedPassword = await bcrypt.hash(body.password, 8);
        }

        let user = new User({
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
        })
        await user.save();
        await User.findByIdAndUpdate(user?._id, {$addToSet: {fcm_token: body.fcm_token}})
        let token = jwt.sign({_id: user?._id}, secret, {expiresIn: '15 days'});
        return res.status(200).send({
            error: false,
            data: {
                token
            }
        });

    } catch (e) {
        if (e?.code === 11000) {
            return res.status(406).send({
                error: true,
                msg: 'An account with this credential has already existed',
            })
        }
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

// user opt verification
export const OTPVerify = async (req, res) => {
    try {
        const {body} = req
        let otp = await OTP.findOne({phone: body.phone, action: 'registration'})
        if (!!otp && otp?.attempts > 0 && body.otp === otp?.code) {
            let token = jwt.sign({phone: body.phone}, secret, {expiresIn: '30m'});
            return res.status(200).send({
                error: false,
                msg: 'otp verified',
                token,
            })
        }
        if (otp) {
            otp.attempts -= 1
            await otp.save()
        }
        return res.status(401).send({
            error: true,
            msg: 'Invalid/Expired otp'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

// user login
export const userLogin = async (req, res) => {
    try {
        let {body} = req;
        if (body.username && body.password) {
            const email = body?.username?.trim().toLowerCase()
            const user = await User.findOne({$or: [{email}, {phone: body.username}]})
                .populate('vehicle', "approved active");
            if (user?.verified === false) {
                return res.status(403).json({
                    error: true,
                    msg: 'Please verify your phone first',
                    data: {
                        phone: user?.phone,
                        verified: user?.verified
                    }
                })
            }
            if (!user?.password) {
                return res.status(403).json({
                    error: true,
                    msg: 'Wrong credential',
                })
            }
            if (user) {
                let auth = await bcrypt.compare(body.password, user.password);
                if (auth) {
                    user.password = undefined;
                    await User.findByIdAndUpdate(user?._id, {$addToSet: {fcm_token: body.fcm_token}})
                    let token = await jwt.sign({_id: user._id}, secret, {expiresIn: '48h'});
                    // @ts-ignore
                    if (user.role === 'driver') {
                        console.log(user)
                        // @ts-ignore
                        if (user?.vehicle?.approved === true) {
                            const driverInfo = await DriverRating.aggregate([
                                {
                                    $match: {
                                        driver: new mongoose.Types.ObjectId(user._id)
                                    }
                                },
                                {
                                    $group: {
                                        _id: null,
                                        rating: {$sum: "$rating"},
                                        count: {$count: {}}
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        total_review: 1,
                                        average_rating: {$divide: ["$rating", "$count"]}
                                    }
                                }
                            ])
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
                            })
                        }
                        return res.status(500).send({
                            error: true,
                            msg: "Your document has not verified yet from the admin",
                            data: {role: user?.role, token}
                        })
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
                    })

                } else {
                    return res.status(401).send({
                        error: true,
                        msg: 'Invalid credentials'
                    })
                }
            }

            return res.status(404).json({
                error: true,
                msg: 'User not found'
            })
        }

        return res.status(404).json({
            error: true,
            msg: 'Wrong Credentials'
        })

    } catch
        (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

// user login
export const userLoginFromWebsite = async (req, res) => {
    try {
        let {body} = req;
        if (body.username && body.password) {
            const email = body?.username?.trim().toLowerCase()
            const user = await User.findOne({$or: [{email}, {phone: body.username}]})
                .populate('vehicle', "approved active");
            if (user?.verified === false) {
                return res.status(403).json({
                    error: true,
                    msg: 'Please verify your phone first',
                    data: {
                        phone: user?.phone,
                        verified: user?.verified
                    }
                })
            }
            if (!user?.password) {
                return res.status(403).json({
                    error: true,
                    msg: 'Wrong credential',
                })
            }
            if (user) {
                let auth = await bcrypt.compare(body.password, user.password);
                if (auth) {
                    user.password = undefined;
                    await User.findByIdAndUpdate(user?._id, {$addToSet: {fcm_token: body.fcm_token}})
                    let token = await jwt.sign({_id: user._id}, secret, {expiresIn: '48h'});
                    if (user.role === 'driver') {
                        const driverInfo = await DriverRating.aggregate([
                            {
                                $match: {
                                    driver: new mongoose.Types.ObjectId(user._id)
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    rating: {$sum: "$rating"},
                                    count: {$count: {}}
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    total_review: 1,
                                    average_rating: {$divide: ["$rating", "$count"]}
                                }
                            }
                        ])
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
                        })
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
                    })
                } else {
                    return res.status(401).send({
                        error: true,
                        msg: 'Invalid credentials'
                    })
                }
            }
            return res.status(404).json({
                error: true,
                msg: 'User not found'
            })
        }
        return res.status(404).json({
            error: true,
            msg: 'Wrong Credentials'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const userSocialLogin = async (req, res) => {
    try {
        let {body} = req
        let decodedToken = await getAuth(firebaseAdmin).verifyIdToken(body?.idToken)
        let user = await User.findOne({email: decodedToken?.email}).populate('vehicle', "approved active");
        if (!user) {
            user = new User({
                name: decodedToken.name,
                email: decodedToken.email?.toLowerCase(),
                image: decodedToken.picture,
                role: body.role,
                verified: true
            })
            await user.save();
        }
        let token = jwt.sign({_id: user?._id}, secret, {expiresIn: '8h'})
        await User.findByIdAndUpdate(user?._id, {$addToSet: {fcm_token: body.fcm_token}})
        if (user?.role === 'driver') {
            const driverInfo = await DriverRating.aggregate([
                {
                    $match: {
                        driver: new mongoose.Types.ObjectId(user._id)
                    }
                },
                {
                    $group: {
                        _id: null,
                        rating: {$sum: "$rating"},
                        count: {$count: {}}
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total_review: 1,
                        average_rating: {$divide: ["$rating", "$count"]}
                    }
                }
            ])
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
            })
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
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Login failed! Try again'
        })
    }
}

export const userSocialLoginByApp = async (req, res) => {
    try {
        let {body} = req;
        let decodedToken = await getAuth(firebaseAdmin).verifyIdToken(body?.idToken)
        let user = await User.findOne({email: decodedToken?.email}).populate('vehicle', "approved active");
        if (!user) {
            user = new User({
                name: decodedToken.name,
                email: decodedToken.email?.toLowerCase(),
                image: decodedToken.picture,
                role: body.role,
                verified: true
            })
            await user.save();
        }

        let token = jwt.sign({_id: user?._id}, secret, {expiresIn: '8h'})
        await User.findByIdAndUpdate(user?._id, {$addToSet: {fcm_token: body.fcm_token}})

        if (user?.role === 'driver') {
            // @ts-ignore
            if (user?.vehicle?.approved === true) {
                const driverInfo = await DriverRating.aggregate([
                    {
                        $match: {
                            driver: new mongoose.Types.ObjectId(user._id)
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            rating: {$sum: "$rating"},
                            count: {$count: {}}
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            total_review: 1,
                            average_rating: {$divide: ["$rating", "$count"]}
                        }
                    }
                ])
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
                })
            }
            return res.status(500).send({
                error: true,
                msg: "Your document has not verified yet from the admin",
                data: {role: user?.role, token, auth_type: body.auth_type}
            })
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
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Login failed! Try again'
        })
    }
}

/*
 * Password reset
 * */
export const sendPasswordResetOtp = async (req, res) => {
    try {
        let {body} = req;
        let user = await User.findOne({phone: body.phone})
        if (!user) {
            return res.status(404).send({
                error: true,
                msg: 'User Not Found'
            })
        }
        let otp = await OTP.findOne({phone: body.phone, action: 'password_reset'});
        if (!!otp) {
            return res.status(401).send({
                error: true,
                msg: 'Already send. Please try again later after 2min'
            });
        }
        let code = generateOTP();
        const otp_msg = `Your verification OTP code ${code}`
        // await sendTwilioSMS(body.phone, otp_msg)
        await OTP.create({
            phone: body.phone,
            code,
            action: 'password_reset'
        })
        return res.status(200).send({
            error: false,
            msg: 'Otp sent',
            data: {
                otp: process.env.PRODUCT_MODE === 'demo' && code,
                phone: body.phone
            }
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
};

export const otpVerifyForResetPassword = async (req, res) => {
    try {
        const {body} = req
        let otp = await OTP.findOne({phone: body.phone, action: 'password_reset'})
        if (!!otp && otp?.attempts > 0 && body.otp === otp?.code) {
            let user = await User.findOne({phone: body.phone}, 'first_name middle_name last_name phone email')
            if (!user) {
                return res.status(404).send({
                    error: true,
                    msg: 'User Not Found'
                })
            }
            let token = jwt.sign({_id: user._id}, secret, {expiresIn: '10m'})
            return res.status(200).send({
                error: false,
                msg: 'Successfully verified',
                token
            })
        }
        if (otp) {
            otp.attempts -= 1
            await otp.save()
        }
        return res.status(401).send({
            error: true,
            msg: 'Invalid/Expired otp'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const changePasswordForOtpRequest = async (req, res) => {
    try {
        let {_id} = res.locals.user || {};
        const {body} = req;
        let user = await User.findById(_id, 'password');
        if (!!user) {
            if (body.password === body.confirmPassword) {
                const hashedPassword = await bcrypt.hash(body.password, 8);
                await User.updateOne({_id: user._id}, {password: hashedPassword})
                return res.status(200).send({
                    error: false,
                    msg: 'Successfully updated',
                })
            }
            return res.status(400).send({
                error: false,
                msg: 'Wrong Input',
            })
        } else {
            return res.status(401).send({
                error: true,
                msg: 'Unauthorized action'
            })
        }
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const passwordResetByToken = async (req, res) => {
    try {
        let {_id} = res.locals.user || {};
        const {body} = req;
        let user = await User.findById(_id, 'password');
        if (!!user && body?.currentPassword) {
            const isMatched = await bcrypt.compare(body.currentPassword, user.password);
            if (isMatched) {
                const hashedPassword = await bcrypt.hash(body.password, 8);
                await User.updateOne({_id: user._id}, {password: hashedPassword})
                return res.status(200).send({
                    error: false,
                    msg: 'Successfully updated',
                })
            } else {
                return res.status(400).send({
                    error: true,
                    msg: 'Wrong Input',
                })
            }
        } else {
            return res.status(401).send({
                error: true,
                msg: 'Unauthorized action'
            })
        }
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const passwordUpdateByAdmin = async (req, res) => {
    try {
        let {user} = res.locals;
        const {body} = req;
        if (user?.role === "admin" && !!body?.password && !!body?.confirmPassword) {
            const hashedPassword = await bcrypt.hash(body.password, 8);
            await User.updateOne({_id: body?._id}, {password: hashedPassword})
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated',
            })
        } else {
            return res.status(400).send({
                error: true,
                msg: 'Wrong Action',
            })
        }
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const accountTemporaryDeactivate = async (req, res) => {
    try {
        let {user} = res.locals;
        const {body} = req;
        if (user?._id) {
            await User.updateOne({_id: user._id}, {$set: {verified: false}})
            return res.status(200).send({
                error: false,
                msg: 'Temporary deactivate successful',
            })
        } else {
            return res.status(200).send({
                error: false,
                msg: 'Authentication failed',
            })
        }
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const userUpdateByToken = async (req, res) => {
    try {
        let {_id} = res.locals.user || {};
        const {body} = req;
        let user = await User.findById(_id);
        if (!!user) {
            delete body.password;
            await User.updateOne({_id: user._id}, {$set: {...body}})
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated',
            })
        } else {
            return res.status(401).send({
                error: true,
                msg: 'Unauthorized action'
            })
        }
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
};

export const userUpdateByAdmin = async (req, res) => {
    try {
        const {body} = req;
        let isUser = await User.findById(body?._id);
        if (!!isUser) {
            delete body.password;
            await User.updateOne({_id: body?._id}, {$set: body})
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated',
            })
        } else {
            return res.status(401).send({
                error: true,
                msg: 'User not found'
            })
        }
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
};

export const sendOtp = async (req, res) => {
    try {
        let {body} = req;
        let otp = await OTP.findOne({phone: body.phone, action: 'registration'})
        if (!!otp) {
            return res.status(401).send({
                error: true,
                msg: 'Already send. Please try again later after 2min'
            });
        }
        let code = generateOTP();
        const otp_msg = `Your verification OTP code ${code}`
        // await sendTwilioSMS(body.phone, otp_msg)
        await OTP.create({
            phone: body.phone,
            code,
            action: 'registration'
        })
        return res.status(200).send({
            error: false,
            msg: 'Otp sent',
            data: {
                otp: process.env.PRODUCT_MODE === 'demo' && code,
                phone: body.phone
            }
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
};

export const resendOTPVerify = async (req, res) => {
    try {
        const {body} = req
        let otp = await OTP.findOne({phone: body.phone, action: body.action})
        if (!!otp && otp?.attempts > 0 && body.otp === otp?.code) {
            let user = await User.findOne({phone: body.phone}, 'first_name middle_name last_name phone email')
            if (!user) {
                return res.status(404).send({
                    error: true,
                    msg: 'User Not Found'
                })
            }
            await User.updateOne({_id: user._id}, {verified: true});
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated',
            })
        }
        if (otp) {
            otp.attempts -= 1
            await otp.save()
        }
        return res.status(401).send({
            error: true,
            msg: 'Invalid/Expired otp'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const getLoginUserDataByToken = async (req, res, next) => {
    try {
        const {user} = res.locals;
        if (!user?._id) {
            return res.status(403).json({
                error: true,
                msg: "Permission denied"
            })
        }
        const userInfo = await User.aggregate([
            {
                $match: {_id: new mongoose.Types.ObjectId(user?._id)}
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
                    let: {"id": '$vehicle'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ["$_id", "$$id"]}
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
            {$unwind: {path: '$vehicle', preserveNullAndEmptyArrays: true}},
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
            })
        }
        return res.status(200).json({
            error: false,
            data: userInfo[0]
        })
    } catch (e) {
        return res.status(200).json({
            error: true,
            data: "Server side error"
        })
    }
}

export const userVerifyByEmailOrPhone = async (req, res, next) => {
    try {
        const {query} = req;
        // @ts-ignore
        const isExit = await User.findOne({$or: [{email: query?.username?.toLowerCase()}, {phone: query?.username}]});
        if (!isExit) {
            return res.status(403).json({
                error: true,
                data: "Please signup first"
            })
        }
        return res.status(200).json({
            error: false,
            data: "login success"
        })
    } catch (e) {
        return res.status(200).json({
            error: true,
            data: "Server side error"
        })
    }
}

/**
 *
 * Driver
 *
 * **/
export const fetchDrivers = async (req, res) => {
    try {
        const {query} = req
        let filter: any = {}
        if (!!query.search) {
            filter = {
                $or: [
                    {"name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"email": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        let data = await User.aggregatePaginate(User.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
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
                    let: {'driver': "$_id"},
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
            {$unwind: {path: '$vehicle', preserveNullAndEmptyArrays: true}},
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
            {$match: filter},
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
            sort: {createdAt: -1},
        });
        return res.status(200).send({
            error: false,
            msg: 'Success',
            data
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}


export const deleteUser = async (req, res) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        if (user?.role === 'admin') {
            await User.deleteOne({_id: query?._id})
            return res.status(200).json({
                error: false,
                data: 'Deleted Successful'
            })
        } else {
            return res.status(200).json({
                error: false,
                data: 'Permission denied'
            })
        }
    } catch (e) {
        return res.status(200).json({
            error: true,
            data: e.message
        })
    }
};

export const userList = async (req, res) => {
    try {
        const {query} = req
        let filter: any = {}
        if (!!query.search) {
            filter = {
                $or: [
                    {"name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"email": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        let data = await User.aggregatePaginate(User.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
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
            {$match: filter},
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
            sort: {createdAt: -1},
        });
        return res.status(200).send({
            error: false,
            msg: 'Success',
            data
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
};

export const userDetails = async (req, res) => {
    try {
        const {query} = req
        // @ts-ignore
        let data = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(query._id),
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
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
};

export const fetchDriverDetails = async (req, res) => {
    try {
        const {query} = req;
        // @ts-ignore
        const drivers = await User.aggregatePaginate(User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(query?._id)
                }
            },
            {
                $lookup: {
                    from: 'vehicles',
                    let: {'driver': '$_id'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ['$driver', '$$driver']}
                            }
                        },
                        {
                            $lookup: {
                                from: 'service_categories',
                                let: {'service_category': '$service_category'},
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {$eq: ['$_id', '$$service_category']}
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
                        {$unwind: {path: "$categories", preserveNullAndEmptyArrays: true}},
                        {
                            $lookup: {
                                from: 'services',
                                let: {'service': '$service'},
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {$eq: ['$_id', '$$service']}
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
                        {$unwind: {path: "$service", preserveNullAndEmptyArrays: true}},
                    ],
                    as: 'vehicle'
                }
            },
            {$unwind: {path: "$vehicle", preserveNullAndEmptyArrays: true}},
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
            sort: {createdAt: -1},
        });

        if (!drivers) {
            return res.status(400).json({
                error: true,
                msg: "Not Found"
            })
        }
        return res.status(200).json({
            error: false,
            data: !!query._id ? drivers?.docs[0] : drivers
        })

    } catch (e) {
        return res.status(200).json({
            error: true,
            data: e.message
        })
    }
}

/**
 * employee
 */
export const employeeCreate = async (req, res) => {
    try {
        const {user: admin} = res.locals;
        let {body} = req;

        let hashedPassword;
        if (body.password) {
            hashedPassword = await bcrypt.hash(body.password, 8);
        }

        if (!!body._id) {
            await User.updateOne({_id: body._id}, {...body, password: hashedPassword});
            return res.status(200).send({
                error: false,
                msg: 'Updated Successful',
            });
        } else {
            const isUser = await User.findOne({
                $or: [
                    {email: body.email},
                    {phone: body.phone},
                ]
            });
            if (!!isUser) {
                return res.status(400).send({
                    error: true,
                    msg: 'An account with this credential has already existed',
                });
            }

            const randomNumberGen = await numberGen(6);
            let user = new User({
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
            })
            await user.save();
            return res.status(200).send({
                error: false,
                msg: 'Successfully employee created'
            });
        }

    } catch (e) {
        return res.status(200).json({
            error: true,
            data: "Server failed"
        })
    }
};

export const employeeList = async (req, res) => {
    try {
        const {query} = req;
        let filter: any = {};
        if (!!query.search) {
            filter = {
                $or: [
                    {"name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"email": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"key": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"department.name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"ticket_departments.name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"ticket_categories.name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const employees = await User.aggregatePaginate(User.aggregate([
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
            {$unwind: {path: "$department", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'roles',
                    localField: 'permission',
                    foreignField: '_id',
                    as: 'permission'
                }
            },
            {$unwind: {path: "$permission", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'ticket_departments',
                    let: {"ticket_departments": "$ticket_departments"},
                    pipeline: [
                        {
                            $match: {$expr: {$in: ["$_id", "$$ticket_departments"]}}
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
            {$unwind: {path: "$ticket_departments", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'ticket_departments',
                    let: {"ticket_categories": "$ticket_categories"},
                    pipeline: [
                        {
                            $match: {$expr: {$in: ["$parent", "$$ticket_categories"]}}
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
            {$unwind: {path: "$ticket_categories", preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    password: 0
                }
            },
            {$match: filter}
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        });

        return res.status(200).json({
            error: false,
            data: employees
        })

    } catch (e) {
        return res.status(200).json({
            error: true,
            data: e.message
        })
    }
}

export const filteringEmployeeList = async (req, res) => {
    try {
        const {query} = req;
        // @ts-ignore
        const employees = await User.aggregatePaginate(User.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [

                            {$eq: ['$role', 'employee']},
                            {$eq: ['$department', new mongoose.Types.ObjectId(query.department)]},
                            {$eq: ['$permission', new mongoose.Types.ObjectId(query.role)]},
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
            {$unwind: {path: "$department", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'roles',
                    localField: 'permission',
                    foreignField: '_id',
                    as: 'permission'
                }
            },
            {$unwind: {path: "$permission", preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    password: 0
                }
            }
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        });

        return res.status(200).json({
            error: false,
            data: employees
        })

    } catch (e) {
        return res.status(200).json({
            error: true,
            data: e.message
        })
    }
}

export const employeeElement = async () => {
    try {
        let employeeRoles = await Role.find({}).select('name');
        let arr = [];
        for (let i = 0; i < employeeRoles.length; i++) {
            if (employeeRoles[i].name === 'user' ||
                employeeRoles[i].name === 'super_admin' ||
                employeeRoles[i].name === 'admin' ||
                employeeRoles[i].name === 'site_admin') {
                continue
            }
            arr.push(employeeRoles[i]);
        }

        return arr;

    } catch (error) {
        return []
    }
}

// group email, sms send
export const groupEmailSend = async (req, res) => {
    try {
        const {body} = req;
        const data = {
            email: body.email,
            subject: body.subject,
            message: body.message
        };
        await sendUserEmailGeneral(data);
        return res.status(500).json({
            error: true,
            data: 'Email sent successfully'
        })

    } catch (e) {
        return res.status(500).json({
            error: true,
            data: e.message
        })
    }
}


/**
 * Driver balance
 * */
export const getDriverPaymentAcceptList = async (req, res) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        let filter: any = {};
        // @ts-ignore
        const balance = await Payment.aggregatePaginate(Payment.aggregate([
            {
                $match: {
                    driver: new mongoose.Types.ObjectId(user._id),
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: {'user': '$user'},
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
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'trip_requests',
                    let: {'trip': '$trip'},
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
            {$unwind: {path: '$trip', preserveNullAndEmptyArrays: true}},
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
            {$match: filter},
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        });
        return res.status(200).json({
            error: false,
            data: balance
        });

    } catch (e) {
        return res.status(500).json({
            error: true,
            data: "Internal Server error"
        })
    }
}

export const getDriverBalanceInfo = async (req, res) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        // @ts-ignore
        const balance = await DriverBalance.aggregate([
            {
                $match: {
                    driver: new mongoose.Types.ObjectId(user?._id),
                }
            },
            {
                $group: {
                    _id: null,
                    amount: {$sum: "$amount"},
                    driver: {$first: '$driver'}
                }
            },
            {
                $lookup: {
                    from: 'withdraws',
                    let: {'driver': '$driver'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$by", "$$driver"]},
                                        {$eq: ["$approved", true]},
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                amount: {$sum: '$amount'},
                                by: {$first: '$by'}
                            }
                        }
                    ],
                    as: 'withdraw'
                }
            },
            {$unwind: {path: '$withdraw', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    total_earning: {$trunc: [{$ifNull: ["$amount", 0]}, 2]},
                    total_withdraw: {$trunc: [{$ifNull: ["$withdraw.amount", 0]}, 2]},
                    remaining_balance: {$trunc: [{$ifNull: [{$subtract: ["$amount", "$withdraw.amount"]}, "$amount"]}, 2]},
                }
            }
        ]);
        return res.status(200).json({
            error: false,
            data: balance
        });
    } catch (e) {
        return res.status(500).json({
            error: true,
            data: "Internal Server error"
        })
    }
}
