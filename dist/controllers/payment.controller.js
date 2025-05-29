"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flutterWavePayment = exports.razorPayVerification = exports.razorPayPayment = exports.molliePaymentCheck = exports.molliePaymentGetaway = exports.paypalPayment = exports.stripePayment = exports.walletPayment = exports.delPayment = exports.getPayment = exports.checkPayment = exports.deleteDriverBalance = exports.driverBalanceList = exports.getPaymentList = void 0;
const payment_model_1 = __importDefault(require("../models/payment.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const settings_model_1 = __importDefault(require("../models/settings.model"));
const wallet_model_1 = __importDefault(require("../models/wallet.model"));
const crypto_1 = __importDefault(require("crypto"));
const trip_request_model_1 = __importDefault(require("../models/trip_request.model"));
const paypal_api_1 = require("../utils/paypal-api");
const api_client_1 = __importDefault(require("@mollie/api-client"));
const razorpay_1 = __importDefault(require("razorpay"));
const process = __importStar(require("process"));
const driver_balance_model_1 = __importDefault(require("../models/driver_balance.model"));
const flutterwave_1 = require("../utils/flutterwave");
// get Payment list
const getPaymentList = async (req, res, next) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { tran_id: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "user.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "user.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "driver.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "driver.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const payments = await payment_model_1.default.aggregatePaginate(payment_model_1.default.aggregate([
            ...((!!user._id && user.role === 'user') ? [
                {
                    $match: {
                        "user": new mongoose_1.default.Types.ObjectId(user._id)
                    }
                },
            ] : []),
            ...((!!user._id && user.role === 'driver') ? [
                {
                    $match: {
                        driver: new mongoose_1.default.Types.ObjectId(user._id),
                    }
                },
            ] : []),
            {
                $lookup: {
                    from: 'users',
                    let: { 'user': '$user' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$user'] } } },
                        { $project: { name: 1, email: 1, image: 1, phone: 1, verified: 1 } }
                    ],
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    let: { 'driver': '$driver' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$driver'] } } },
                        { $project: { name: 1, email: 1, image: 1, phone: 1, verified: 1 } }
                    ],
                    as: 'driver'
                }
            },
            { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'trip_requests',
                    let: { 'trip': '$trip' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$trip'] } } },
                        {
                            $project: {
                                pickupLocation: 1,
                                dropLocation: 1,
                                distance: 1,
                                date: 1,
                                time: 1,
                                total: 1,
                                status: 1,
                            }
                        }
                    ],
                    as: 'trip'
                }
            },
            { $unwind: { path: '$trip', preserveNullAndEmptyArrays: true } },
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 15,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: payments
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.getPaymentList = getPaymentList;
const driverBalanceList = async (req, res) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        let filter = {};
        const roles = ['admin', 'driver'];
        if (!roles.includes(user?.role)) {
            return res.status(403).json({
                error: true,
                msg: "Authentication failed"
            });
        }
        if (query.search) {
            filter = {
                $or: [
                    { trx_id: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "driver.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "driver.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const balances = await driver_balance_model_1.default.aggregatePaginate(payment_model_1.default.aggregate([
            ...((!!user._id && user.role === 'admin') ? [
                {
                    $match: {}
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { 'driver': '$driver' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$driver'] } } },
                            { $project: { name: 1, email: 1, image: 1, phone: 1, verified: 1 } }
                        ],
                        as: 'driver'
                    }
                },
                { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
            ] : []),
            ...((!!user._id && user.role === 'driver') ? [
                {
                    $match: {
                        driver: new mongoose_1.default.Types.ObjectId(user._id),
                    }
                },
            ] : []),
            {
                $lookup: {
                    from: 'trip_requests',
                    let: { 'trip': '$trip' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$trip'] } } },
                        {
                            $project: {
                                pickupLocation: 1,
                                dropLocation: 1,
                                distance: 1,
                                subtotal: { $trunc: [{ $ifNull: ["$subtotal", 0] }, 2] },
                                vat: 1,
                                total: { $trunc: [{ $ifNull: ["$total", 0] }, 2] },
                                status: 1,
                                discount: 1,
                                payments: 1
                            }
                        }
                    ],
                    as: 'trip'
                }
            },
            { $unwind: { path: '$trip', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    driver: 1,
                    trip: 1,
                    earning_amount: { $trunc: [{ $ifNull: ["$amount", 0] }, 2] },
                    createdAt: 1,
                    updatedAt: 1,
                }
            },
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 15,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: balances
        });
    }
    catch (e) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.driverBalanceList = driverBalanceList;
const deleteDriverBalance = async (req, res) => {
    try {
        const { query } = req;
        await driver_balance_model_1.default.findByIdAndDelete({ _id: query?._id });
        return res.status(200).json({
            error: true,
            msg: 'driver balance deleted'
        });
    }
    catch (e) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.deleteDriverBalance = deleteDriverBalance;
const checkPayment = async (req, res) => {
    try {
        const { query } = req;
        const trip = await driver_balance_model_1.default.findOne({ trip: new mongoose_1.default.Types.ObjectId(query.trip) });
        let paymentStatus;
        paymentStatus = !!trip;
        return res.status(200).json({
            error: false,
            data: {
                payment: paymentStatus
            }
        });
    }
    catch (e) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.checkPayment = checkPayment;
const getPayment = async (req, res, next) => {
    try {
        const { query } = req;
        // @ts-ignore
        const payments = await payment_model_1.default.aggregatePaginate(payment_model_1.default.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            {
                $lookup: {
                    from: 'users',
                    let: { 'user': '$user' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$user'] } } },
                        { $project: { name: 1, email: 1, image: 1, phone: 1, verified: 1 } }
                    ],
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    let: { 'driver': '$driver' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$driver'] } } },
                        { $project: { name: 1, email: 1, image: 1, phone: 1, verified: 1 } }
                    ],
                    as: 'driver'
                }
            },
            { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'trip_requests',
                    let: { 'trip': '$trip' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$trip'] } } },
                        {
                            $project: {
                                pickupLocation: 1,
                                dropLocation: 1,
                                distance: 1, date: 1,
                                time: 1,
                                total: 1,
                                status: 1,
                            }
                        }
                    ],
                    as: 'trip'
                }
            },
            { $unwind: { path: '$trip', preserveNullAndEmptyArrays: true } },
        ]), {
            page: query.page || 1,
            limit: query.size || 15,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: payments.docs[0]
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.getPayment = getPayment;
// delete Payment
const delPayment = async (req, res, next) => {
    try {
        const { query } = req;
        await payment_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.delPayment = delPayment;
/**
 *
 * Payment Gateway
 *
 * **/
const walletPayment = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { user } = res.locals;
        const { body } = req;
        // @ts-ignore
        const userWallet = await wallet_model_1.default.aggregate([
            {
                $match: {
                    user: user?._id
                }
            },
            {
                $group: {
                    _id: null,
                    user: { $first: "$user" },
                    balance: { $sum: "$amount" }
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    let: { "user": '$user' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user', '$$user'] },
                                        { $eq: ['$payment_method', 'wallet'] },
                                        { $eq: ['$status', 'paid'] },
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                user: { $first: "$user" },
                                totalPayment: { $sum: "$amount" }
                            }
                        },
                        {
                            $project: {
                                user: 1,
                                total: { $ifNull: ["$totalPayment", 0] }
                            }
                        }
                    ],
                    as: 'payments'
                }
            },
            { $unwind: { path: '$payments', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    user: 1,
                    currentBalance: { $ifNull: [{ $subtract: ["$balance", "$payments.total"] }, "$balance"] }
                }
            }
        ]);
        if ((Number(userWallet[0]?.currentBalance) >= Number(body.wallet_amount)) && (Number(userWallet[0]?.currentBalance) > 0)) {
            const transaction_id = crypto_1.default.randomBytes(4).toString('hex') + (new Date()).getTime();
            const trip = await trip_request_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(body.trip_id) });
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            const currentFareAmount = Number(trip?.total) - Number(paid);
            let paid_amount = Number(body.wallet_amount) > currentFareAmount ? currentFareAmount : Number(body.wallet_amount);
            const data = {
                fare: Number(trip?.total),
                due: (+currentFareAmount) - (+paid_amount),
                paid: Number(paid_amount),
                current_wallet_balance: Number((Number(userWallet[0]?.currentBalance) - Number(paid_amount)).toFixed(2))
            };
            const payment = await payment_model_1.default.create([{
                    user: user?._id,
                    driver: trip?.driver,
                    trip: trip?._id,
                    payment_method: 'wallet',
                    status: 'paid',
                    tran_id: transaction_id,
                    amount: paid_amount,
                }], { session });
            const latestTripData = await trip_request_model_1.default.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: payment[0]?._id,
                        method: "wallet",
                        amount: payment[0]?.amount
                    },
                },
            }, { session, new: true });
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            if ((payment[0]?.amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await driver_balance_model_1.default.create([{
                        driver: trip?.driver,
                        trip: trip?._id,
                        amount: +trip?.subtotal
                    }], { session });
            }
            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // socket event to the driver
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }
            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            });
        }
        return res.status(400).json({
            error: true,
            msg: 'You have no enough balance',
            data: userWallet
        });
    }
    catch (e) {
        console.log(e);
        await session.abortTransaction();
        return res.status(500).json({
            error: true,
            msg: "Transaction Failed"
        });
    }
    finally {
        await session.endSession();
    }
};
exports.walletPayment = walletPayment;
/**
 * stripe payment
 * */
const stripePayment = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { tripInfo, token } = req.body;
        const { user } = res.locals;
        if (!user?._id) {
            return res.status(200).json({
                status: true,
                message: 'Authorization Failed!'
            });
        }
        const settings = await settings_model_1.default.findOne({});
        const stripe = require("stripe")(`${process.env.STRIPE_SECRET}`);
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id,
        });
        const idempotencyKey = (0, uuid_1.v4)();
        const charge = await stripe.charges.create({
            amount: Math.round(tripInfo?.amount * 100),
            currency: `${tripInfo?.countryCurrency.toLowerCase()}`,
            customer: customer.id,
            receipt_email: token.email,
            description: `${tripInfo.description}`,
            shipping: {
                name: token.card.name,
                address: {
                    line1: token.card.address_line1,
                    line2: token.card.address_line2,
                    city: token.card.address_country,
                    postal_code: token.card.address_zip,
                },
            },
        }, {
            idempotencyKey
        });
        if (charge?.paid === true) {
            const transaction_id = crypto_1.default.randomBytes(4).toString('hex') + (new Date()).getTime();
            const trip = await trip_request_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(tripInfo?._id) });
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            const currentFareAmount = Number(trip?.total) - Number(paid);
            let paid_amount = Number(tripInfo?.amount) > currentFareAmount ? currentFareAmount : Number(tripInfo?.amount);
            const data = {
                fare: Number(trip?.total),
                due: (+currentFareAmount) - (+paid_amount),
                paid: Number(paid_amount),
            };
            const payment = await payment_model_1.default.create([{
                    user: user?._id,
                    driver: trip?.driver,
                    trip: trip?._id,
                    payment_method: 'stripe',
                    status: 'paid',
                    tran_id: transaction_id,
                    amount: +paid_amount,
                }], { session });
            const latestTripData = await trip_request_model_1.default.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: payment[0]?._id,
                        method: "stripe",
                        amount: payment[0]?.amount
                    },
                },
            }, { session, new: true });
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            if ((payment[0]?.amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await driver_balance_model_1.default.create([{
                        driver: trip?.driver,
                        trip: trip?._id,
                        amount: +trip?.subtotal
                    }], { session });
            }
            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }
            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            });
        }
        await session.commitTransaction();
        return res.status(200).json({
            status: true,
            message: 'Payment Failed'
        });
    }
    catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            status: false,
            msg: "Transaction Failed"
        });
    }
    finally {
        await session.endSession();
    }
};
exports.stripePayment = stripePayment;
/**
 * paypal payment
 * */
const paypalPayment = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { details, tripInfo } = req.body;
        const { user } = res.locals;
        if (!user?._id) {
            return res.status(200).json({
                status: true,
                message: 'Authorization Failed!'
            });
        }
        const paypalOrder = await (0, paypal_api_1.getOrderDetails)(details?.orderID);
        if ((paypalOrder?.status === 'COMPLETED') && (details?.orderID === paypalOrder?.id)) {
            const transaction_id = crypto_1.default.randomBytes(4).toString('hex') + (new Date()).getTime();
            const trip = await trip_request_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(tripInfo?._id) });
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            const currentFareAmount = Number(trip?.total) - Number(paid);
            let paid_amount = Number(paypalOrder.purchase_units[0].amount.value) > currentFareAmount ? currentFareAmount : Number(paypalOrder.purchase_units[0].amount.value);
            const data = {
                fare: Number(trip?.total),
                due: (Number(currentFareAmount) - Number(paid_amount)),
                paid: Number(paid_amount),
            };
            const payment = await payment_model_1.default.create([{
                    user: user?._id,
                    driver: trip?.driver,
                    trip: trip?._id,
                    payment_method: 'paypal',
                    status: 'paid',
                    tran_id: transaction_id,
                    amount: Number(paid_amount),
                }], { session });
            const latestTripData = await trip_request_model_1.default.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: payment[0]?._id,
                        method: "paypal",
                        amount: payment[0]?.amount
                    },
                },
            }, { session, new: true });
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            if ((payment[0]?.amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await driver_balance_model_1.default.create([{
                        driver: trip?.driver,
                        trip: trip?._id,
                        amount: +trip?.subtotal
                    }], { session });
            }
            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }
            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            });
        }
        else {
            await session.abortTransaction();
            return res.status(400).json({
                error: true,
                msg: 'Payment Failed'
            });
        }
    }
    catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
    finally {
        await session.endSession();
    }
};
exports.paypalPayment = paypalPayment;
/**
 * Mollie Payment
 * */
const molliePaymentGetaway = async (req, res, next) => {
    try {
        const orderId = (0, uuid_1.v4)();
        const url = `${req.protocol}://${req.get('host')}/`;
        const transaction_id = crypto_1.default.randomBytes(4).toString('hex') + (new Date()).getTime();
        const trip = await trip_request_model_1.default.findById(req.body.trip_id);
        // @ts-ignore
        const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
        const currentFareAmount = Number(trip?.total) - Number(paid);
        let paid_amount = Number(req.body.price) > currentFareAmount ? currentFareAmount : Number(req.body.price);
        // @ts-ignore
        const setAmount = `${parseFloat(Number(paid_amount)).toFixed(2)}`;
        const envFileData = await settings_model_1.default.findOne({});
        const mollieClient = (0, api_client_1.default)({ apiKey: process.env.mollie_live_api_key });
        const payment = await mollieClient.payments.create({
            amount: { value: setAmount, currency: 'EUR' },
            description: req.body.description,
            redirectUrl: `${url}api/payment/webhook?id=${orderId}`,
            metadata: { orderId },
        });
        // Redirect the consumer to complete the payment using `payment.getPaymentUrl()`.
        // save info into the database
        await payment_model_1.default.create({
            user: res.locals.user._id,
            driver: trip?.driver,
            trip: trip?._id,
            payment_method: 'mollie',
            status: 'pending',
            tran_id: transaction_id,
            amount: setAmount,
            payment
        });
        return res.send(payment.getPaymentUrl());
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server failed"
        });
    }
};
exports.molliePaymentGetaway = molliePaymentGetaway;
// mollie payment check
const molliePaymentCheck = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        // fetch data from orderId
        const findPayment = await payment_model_1.default.findOne({ "payment.metadata.orderId": req.query.id });
        if (!findPayment)
            return res.status(400).json({ status: false, message: "Sorry! Payment Failed..." });
        const envFileData = await settings_model_1.default.findOne({});
        const mollieClient = (0, api_client_1.default)({ apiKey: process.env.mollie_live_api_key });
        // check payment by id
        const payment = await mollieClient.payments.get(findPayment.payment.id);
        if (payment.isPaid()) {
            // Hooray, you've received a payment! You can start shipping to the consumer.
            const trip = await trip_request_model_1.default.findOne({ _id: findPayment.trip });
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            const currentFareAmount = Number(trip?.total) - Number(paid);
            let paid_amount = Number(findPayment.amount) > currentFareAmount ? currentFareAmount : Number(findPayment.amount);
            const data = {
                fare: Number(trip?.total),
                due: (Number(currentFareAmount) - Number(paid_amount)),
                paid: Number(paid_amount),
            };
            const payment = await payment_model_1.default.findByIdAndUpdate({ _id: findPayment._id }, { status: 'paid' }, {
                new: true,
                session
            });
            const latestTripData = await trip_request_model_1.default.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: findPayment._id,
                        method: "mollie",
                        amount: Number(findPayment.amount)
                    },
                }
            }, { session, new: true });
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            if ((payment?.amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await driver_balance_model_1.default.create([{
                        driver: trip?.driver,
                        trip: trip?._id,
                        amount: +trip?.subtotal
                    }], { session });
            }
            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }
            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            });
        }
        else if (!payment.isOpen()) {
            // The payment isn't paid and has expired. We can assume it was aborted.
            return res.status(400).json({
                status: false,
                message: 'Payment time out or canceled!',
            });
        }
        return res.status(400).json({
            status: false,
            message: 'Payment Failed',
            payment
        });
    }
    catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
    finally {
        await session.endSession();
    }
};
exports.molliePaymentCheck = molliePaymentCheck;
/**
 * RazorPay Payment
 * */
const razorPayPayment = async (req, res) => {
    try {
        const envFileData = await settings_model_1.default.findOne({});
        const instance = new razorpay_1.default({
            key_id: process.env.razorpay_client_id,
            key_secret: process.env.razorpay_secret_key,
        });
        const options = {
            // @ts-ignore
            amount: parseInt(req.body.amount * 100),
            currency: req.body?.currency,
            receipt: crypto_1.default.randomBytes(10).toString("hex"),
        };
        instance.orders.create(options, (error, order) => {
            if (error) {
                return res.status(500).json({ error: true, msg: "Something Went Wrong!" });
            }
            return res.status(200).json({ data: order });
        });
    }
    catch (error) {
        return res.status(500).json({ msg: "Internal Server Error!" });
    }
};
exports.razorPayPayment = razorPayPayment;
const razorPayVerification = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { product } = req.body;
        const envFileData = await settings_model_1.default.findOne({});
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.response;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto_1.default
            .createHmac("sha256", process.env.razorpay_secret_key)
            .update(sign.toString())
            .digest("hex");
        if (razorpay_signature === expectedSign) {
            const transaction_id = crypto_1.default.randomBytes(4).toString('hex') + (new Date()).getTime();
            const trip = await trip_request_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(product?.trip_id) });
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            const currentFareAmount = Number(trip?.total) - Number(paid);
            let paid_amount = Number(product.amount) > currentFareAmount ? currentFareAmount : Number(product.amount);
            const data = {
                fare: Number(trip?.total),
                due: (Number(currentFareAmount) - Number(paid_amount)),
                paid: Number(paid_amount),
            };
            const payment = await payment_model_1.default.create([{
                    user: res.locals.user._id,
                    driver: trip?.driver,
                    trip: trip?._id,
                    payment_method: 'razorpay',
                    status: 'paid',
                    tran_id: transaction_id,
                    amount: Number(paid_amount),
                }], { session });
            const latestTripData = await trip_request_model_1.default.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: payment[0]?._id,
                        method: "razorpay",
                        amount: payment[0]?.amount
                    },
                }
            }, { session, new: true });
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            if ((payment[0].amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await driver_balance_model_1.default.create([{
                        driver: trip?.driver,
                        trip: trip?._id,
                        amount: +trip?.subtotal
                    }], { session });
            }
            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }
            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            });
        }
        else {
            await session.abortTransaction();
            return res.status(400).json({ error: true, msg: "Invalid signature sent!" });
        }
    }
    catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ error: true, msg: "Internal Server Error!" });
    }
    finally {
        await session.endSession();
    }
};
exports.razorPayVerification = razorPayVerification;
// Flutter-wave payment
const flutterWavePayment = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { user } = res.locals;
        const { transactionId, tripId, countryCurrency, amount, tx_ref } = req.body;
        const payment_response = await (0, flutterwave_1.getFlutterWaveTransaction)(transactionId);
        if (payment_response?.status === 'success' && payment_response?.data?.tx_ref === tx_ref) {
            const transaction_id = crypto_1.default.randomBytes(4).toString('hex') + (new Date()).getTime();
            const trip = await trip_request_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(tripId) });
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            const currentFareAmount = Number(trip?.total) - Number(paid);
            let paid_amount = Number(payment_response?.data?.amount) > currentFareAmount ? currentFareAmount : Number(payment_response?.data?.amount);
            const data = {
                fare: Number(trip?.total),
                due: (+currentFareAmount) - (+paid_amount),
                paid: Number(paid_amount),
            };
            const payment = await payment_model_1.default.create([{
                    user: user?._id,
                    driver: trip?.driver,
                    trip: trip?._id,
                    payment_method: 'flutterwave',
                    status: 'paid',
                    tran_id: transaction_id,
                    amount: +paid_amount,
                }], { session });
            const latestTripData = await trip_request_model_1.default.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: payment[0]?._id,
                        method: "flutterwave",
                        amount: payment[0]?.amount
                    },
                },
            }, { session, new: true });
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            if ((payment[0]?.amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await driver_balance_model_1.default.create([{
                        driver: trip?.driver,
                        trip: trip?._id,
                        amount: +trip?.subtotal
                    }], { session });
            }
            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }
            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            });
        }
        await session.commitTransaction();
        return res.status(200).json({
            status: true,
            message: 'Payment Failed'
        });
    }
    catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            status: false,
            msg: "Transaction Failed"
        });
    }
    finally {
        await session.endSession();
    }
};
exports.flutterWavePayment = flutterWavePayment;
/**
 *
 * */
// payment
const paymentWorker = async ({ trip_id, user_amount, userWallet, user, payment_method, session }) => {
    const transaction_id = crypto_1.default.randomBytes(4).toString('hex') + (new Date()).getTime();
    const trip = await trip_request_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(trip_id) });
    // @ts-ignore
    const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
    const currentFareAmount = Number(trip?.total) - Number(paid);
    let paid_amount = Number(user_amount) > currentFareAmount ? currentFareAmount : Number(user_amount);
    const data = userWallet ? {
        fare: Number(trip?.total),
        due: (+currentFareAmount) - (+paid_amount),
        paid: Number(paid_amount),
        current_wallet_balance: Number((Number(userWallet[0]?.currentBalance) - Number(paid_amount)).toFixed(2))
    } :
        {
            fare: Number(trip?.total),
            due: (+currentFareAmount) - (+paid_amount),
            paid: Number(paid_amount),
        };
    const payment = await payment_model_1.default.create([{
            user: user?._id,
            driver: trip?.driver,
            trip: trip?._id,
            payment_method: payment_method,
            status: 'paid',
            tran_id: transaction_id,
            amount: paid_amount,
        }], { session });
    const latestTripData = await trip_request_model_1.default.findByIdAndUpdate(trip?._id, {
        $push: {
            payments: {
                _id: payment[0]?._id,
                method: payment_method,
                amount: payment[0]?.amount
            },
        },
    }, { session, new: true });
    // @ts-ignore
    const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
    if ((payment[0].amount >= trip?.total) || (paidCalculation >= trip?.total)) {
        await driver_balance_model_1.default.create([{
                driver: trip?.driver,
                trip: trip?._id,
                amount: +trip?.subtotal
            }], { session });
    }
    return data;
};
// get one trip details
const getTripInformation = async (trip_id) => {
    const trip = await trip_request_model_1.default.aggregate([
        {
            $match: {
                _id: trip_id
            }
        },
        {
            $lookup: {
                from: 'users',
                let: { "user": "$user" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$user"] } } },
                    { $project: { _id: 1, name: 1, email: 1, phone: 1, image: 1 } }
                ],
                as: 'user'
            }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                let: { "driver": "$driver" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$driver"] } } },
                    { $project: { _id: 1, name: 1, email: 1, phone: 1, image: 1 } }
                ],
                as: 'driver'
            }
        },
        { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'driver_ratings',
                let: { "trip": "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$trip", "$$trip"] }
                        }
                    },
                ],
                as: 'rating'
            }
        },
        { $unwind: { path: '$rating', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                user: 1,
                driver: 1,
                rating: 1,
                pickupLocation: 1,
                dropLocation: 1,
                distance: 1,
                subtotal: 1,
                vat: 1,
                total: 1,
                discount: 1,
                payment_method: 1,
                payments: 1,
                paid: {
                    $reduce: {
                        input: "$payments",
                        initialValue: 0,
                        in: {
                            $add: ["$$value", "$$this.amount"]
                        }
                    }
                },
                vehicle: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                due: {
                    $round: [
                        {
                            $subtract: ["$total", {
                                    $reduce: {
                                        input: "$payments",
                                        initialValue: 0,
                                        in: {
                                            $add: ["$$value", "$$this.amount"]
                                        }
                                    }
                                }]
                        }, 2
                    ]
                },
            }
        },
    ]);
    return trip[0];
};
//# sourceMappingURL=payment.controller.js.map