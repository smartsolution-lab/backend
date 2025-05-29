"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipsThroughMollieCheck = exports.tipsThroughMollie = exports.tipsThroughPaypal = exports.tipsThroughStripe = exports.tipsThroughWallet = exports.getRatingList = exports.delDriverRating = exports.getDriverRatings = exports.postDriverRating = void 0;
const driver_rating_model_1 = __importDefault(require("../models/driver_rating.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const wallet_model_1 = __importDefault(require("../models/wallet.model"));
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const trip_request_model_1 = __importDefault(require("../models/trip_request.model"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const driver_balance_model_1 = __importDefault(require("../models/driver_balance.model"));
const settings_model_1 = __importDefault(require("../models/settings.model"));
const process_1 = __importDefault(require("process"));
const paypal_api_1 = require("../utils/paypal-api");
const api_client_1 = __importDefault(require("@mollie/api-client"));
const moment_1 = __importDefault(require("moment/moment"));
const postDriverRating = async (req, res, next) => {
    try {
        const { body } = req;
        const { user } = res.locals;
        if (!user?._id) {
            return res.status(403).json({
                error: true,
                msg: 'Permission denied'
            });
        }
        if (body._id) {
            await driver_rating_model_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            delete body._id;
            await driver_rating_model_1.default.create({ ...body, user: user?._id });
            return res.status(200).json({
                error: false,
                msg: 'Thanks for your valuable rating'
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postDriverRating = postDriverRating;
const getDriverRatings = async (req, res, next) => {
    try {
        let { query } = req;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    { rating: Number(query.search) },
                    { "driver.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "driver.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "user.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "user.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const data = await driver_rating_model_1.default.aggregatePaginate(driver_rating_model_1.default.aggregate([
            ...((!!query.start && !!query.end) ? [
                {
                    $match: {
                        createdAt: {
                            $gte: (0, moment_1.default)(query.start).toDate(),
                            $lte: (0, moment_1.default)(query.end).toDate(),
                        }
                    }
                },
            ] : []),
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            ...(!!query.driver ? [
                {
                    $match: {
                        driver: new mongoose_1.default.Types.ObjectId(query.driver)
                    }
                },
            ] : []),
            {
                $lookup: {
                    from: 'users',
                    let: { 'driver': '$driver' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$driver'] }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                image: 1,
                                phone: 1
                            }
                        }
                    ],
                    as: 'driver'
                }
            },
            { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    let: { 'user': '$user' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$user'] }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                image: 1,
                                phone: 1
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    __v: 0
                }
            },
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        let driverInfo = [];
        if (query?.driver) {
            driverInfo = await driver_rating_model_1.default.aggregate([
                {
                    $match: {
                        driver: new mongoose_1.default.Types.ObjectId(query.driver)
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { 'driver': '$driver' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$_id', '$$driver'] }
                                }
                            },
                            {
                                $project: {
                                    first_name: 1,
                                    middle_name: 1,
                                    last_name: 1,
                                    name: 1,
                                    email: 1,
                                    image: 1,
                                    phone: 1
                                }
                            }
                        ],
                        as: 'driver'
                    }
                },
                { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: null,
                        driver: { $first: "$driver" },
                        count: { $count: {} },
                        rating: { $sum: "$rating" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        driver: 1,
                        rating: { $divide: ["$rating", "$count"] }
                    }
                }
            ]);
        }
        return res.status(200).json({
            error: false,
            data: !!query._id ? data?.docs[0] : { element: driverInfo[0], ...data }
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getDriverRatings = getDriverRatings;
const delDriverRating = async (req, res, next) => {
    try {
        const { query } = req;
        await driver_rating_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.delDriverRating = delDriverRating;
const getRatingList = async (req, res, next) => {
    try {
        let { query } = req;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    { rating: Number(query.search) },
                    { "user.name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "user.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "driver.name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "driver.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const data = await driver_rating_model_1.default.aggregatePaginate(driver_rating_model_1.default.aggregate([
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
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$user'] }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                image: 1,
                                phone: 1
                            }
                        }
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
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$driver'] }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                image: 1,
                                phone: 1
                            }
                        }
                    ],
                    as: 'driver'
                }
            },
            { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: !!query._id ? data?.docs[0] : data
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getRatingList = getRatingList;
/**
 *
 *  Review + tips
 *
 * **/
const tipsThroughWallet = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
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
        if ((Number(userWallet[0]?.currentBalance) >= Number(body.tips_amount)) && (Number(userWallet[0]?.currentBalance) > 0)) {
            const transaction_id = crypto_1.default.randomBytes(4).toString('hex') + (new Date()).getTime();
            const trip = await trip_request_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(body.review.trip) });
            const data = {
                current_wallet_balance: Number((Number(userWallet[0]?.currentBalance) - Number(body.tips_amount)).toFixed(2))
            };
            const payment = await payment_model_1.default.create([{
                    user: user?._id,
                    driver: trip?.driver,
                    trip: trip?._id,
                    payment_method: 'wallet',
                    status: 'paid',
                    tran_id: transaction_id,
                    amount: +body.tips_amount,
                    tips: true,
                }], { session });
            await driver_rating_model_1.default.create([{ ...body.review, user: trip?.user, driver: trip?.driver }], { session });
            if (+payment[0]?.amount > 0) {
                await driver_balance_model_1.default.create([{
                        driver: trip?.driver,
                        trip: trip?._id,
                        amount: +body.tips_amount
                    }], { session });
            }
            await session.commitTransaction();
            return res.status(200).json({
                error: false,
                msg: 'Tips successfully done',
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
exports.tipsThroughWallet = tipsThroughWallet;
const tipsThroughStripe = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { review, token } = req.body || {};
        const { body } = req;
        const { user } = res.locals;
        if (!user?._id) {
            return res.status(200).json({
                status: true,
                message: 'Authorization Failed!'
            });
        }
        const settings = await settings_model_1.default.findOne({});
        const stripe = require("stripe")(`${process_1.default.env.STRIPE_SECRET}`);
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id,
        });
        const idempotencyKey = (0, uuid_1.v4)();
        const charge = await stripe.charges.create({
            amount: Math.round((+body?.tips_amount) * 100),
            currency: `${body?.countryCurrency.toLowerCase()}`,
            customer: customer.id,
            receipt_email: token.email,
            description: `${review.comment}`,
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
            const trip = await trip_request_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(review.trip) });
            const payment = await payment_model_1.default.create([{
                    user: user?._id,
                    driver: trip?.driver,
                    trip: trip?._id,
                    payment_method: 'stripe',
                    status: 'paid',
                    tran_id: transaction_id,
                    amount: +body.tips_amount,
                    tips: true,
                }], { session });
            await driver_rating_model_1.default.create([{ ...review, user: trip?.user, driver: trip?.driver }], { session });
            if (+payment[0]?.amount > 0) {
                await driver_balance_model_1.default.create([{
                        driver: trip?.driver,
                        trip: trip?._id,
                        amount: +body.tips_amount
                    }], { session });
            }
            await session.commitTransaction();
            return res.status(200).json({
                error: false,
                msg: 'Tips successfully done',
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
exports.tipsThroughStripe = tipsThroughStripe;
const tipsThroughPaypal = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { details, review } = req.body;
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
            const trip = await trip_request_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(review.trip) });
            const payment = await payment_model_1.default.create([{
                    user: user?._id,
                    driver: trip?.driver,
                    trip: trip?._id,
                    payment_method: 'paypal',
                    status: 'paid',
                    tran_id: transaction_id,
                    amount: +paypalOrder.purchase_units[0].amount.value,
                    tips: true,
                }], { session });
            await driver_rating_model_1.default.create([{ ...review, user: trip?.user, driver: trip?.driver }], { session });
            if (+payment[0]?.amount > 0) {
                await driver_balance_model_1.default.create([{
                        driver: trip?.driver,
                        trip: trip?._id,
                        amount: +paypalOrder.purchase_units[0].amount.value
                    }], { session });
            }
            await session.commitTransaction();
            return res.status(200).json({
                error: false,
                msg: 'Tips successfully done',
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
exports.tipsThroughPaypal = tipsThroughPaypal;
const tipsThroughMollie = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const orderId = (0, uuid_1.v4)();
        const url = `${req.protocol}://${req.get('host')}/`;
        // @ts-ignore
        const setAmount = `${parseFloat(Number(req.body.tips_amount)).toFixed(2)}`;
        const envFileData = await settings_model_1.default.findOne({});
        const mollieClient = (0, api_client_1.default)({ apiKey: process_1.default.env.mollie_live_api_key });
        const payment = await mollieClient.payments.create({
            amount: { value: setAmount, currency: 'EUR' },
            description: req.body.review.comment,
            redirectUrl: `${url}api/rating/driver/tips-mollie-webhook?id=${orderId}`,
            metadata: { orderId },
        });
        // Redirect the consumer to complete the payment using `payment.getPaymentUrl()`.
        // save info into the database
        const trip = await trip_request_model_1.default.findById(req.body.review.trip);
        const transaction_id = crypto_1.default.randomBytes(4).toString('hex') + (new Date()).getTime();
        await payment_model_1.default.create([{
                user: res.locals.user._id,
                driver: trip?.driver,
                trip: trip?._id,
                payment_method: 'mollie',
                status: 'pending',
                tran_id: transaction_id,
                amount: setAmount,
                payment
            }], { session });
        await driver_rating_model_1.default.create([{ ...req.body.review, user: trip?.user, driver: trip?.driver }], { session });
        await session.commitTransaction();
        return res.send(payment.getPaymentUrl());
    }
    catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            error: true,
            msg: "Server failed"
        });
    }
    finally {
        await session.endSession();
    }
};
exports.tipsThroughMollie = tipsThroughMollie;
// mollie payment check
const tipsThroughMollieCheck = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // fetch data from orderId
        const findPayment = await payment_model_1.default.findOne({ "payment.metadata.orderId": req.query.id });
        if (!findPayment)
            return res.status(400).json({ status: false, message: "Sorry! Payment Failed..." });
        const envFileData = await settings_model_1.default.findOne({});
        const mollieClient = (0, api_client_1.default)({ apiKey: process_1.default.env.mollie_live_api_key });
        // check payment by id
        const payment = await mollieClient.payments.get(findPayment.payment.id);
        if (payment.isPaid()) {
            const trip = await trip_request_model_1.default.findOne({ _id: findPayment?.trip });
            await payment_model_1.default.updateOne({ _id: findPayment._id }, { status: 'paid' }, { session });
            if (+findPayment.amount > 0) {
                await driver_balance_model_1.default.create([{
                        driver: trip?.driver,
                        trip: trip?._id,
                        amount: +findPayment.amount
                    }], { session });
            }
            await session.commitTransaction();
            return res.status(200).json({
                error: false,
                msg: 'Tips successfully done',
            });
        }
        else if (!payment.isOpen()) {
            // The payment isn't paid and has expired. We can assume it was aborted.
            return res.status(400).json({
                status: false,
                message: 'Tips time out or canceled!',
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
exports.tipsThroughMollieCheck = tipsThroughMollieCheck;
//# sourceMappingURL=rating.controller.js.map