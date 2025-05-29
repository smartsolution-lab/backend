"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delWallet = exports.getUserWalletShortInfo = exports.getWalletTransactionsApp = exports.getWalletTransactions = exports.getWalletListApp = exports.getWalletDepositList = exports.getWalletList = exports.paypalWallet = exports.stripeWallet = exports.flutterWaveWallet = void 0;
const wallet_model_1 = __importDefault(require("../models/wallet.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const settings_model_1 = __importDefault(require("../models/settings.model"));
const paypal_api_1 = require("../utils/paypal-api");
const payment_model_1 = __importDefault(require("../models/payment.model"));
const flutterwave_1 = require("../utils/flutterwave");
// Flutter-wave payment
const flutterWaveWallet = async (req, res) => {
    try {
        const { user } = res.locals;
        const { transactionId, tx_ref } = req.body;
        const payment_response = await (0, flutterwave_1.getFlutterWaveTransaction)(transactionId);
        if (payment_response?.status === 'success' && payment_response?.data?.tx_ref === tx_ref) {
            await wallet_model_1.default.create({
                user: user._id,
                amount: payment_response?.data?.charged_amount,
                deposit_method: "flutterwave"
            });
            return res.status(200).json({
                error: false,
                msg: 'Deposit successful, thanks'
            });
        }
        return res.status(400).json({
            error: true,
            msg: 'Deposit Failed, please try again'
        });
    }
    catch (error) {
        return res.status(500).json({ msg: "Internal Server Error!" });
    }
};
exports.flutterWaveWallet = flutterWaveWallet;
// Stripe Wallet
const stripeWallet = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { deposit, token } = req.body;
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
            amount: Math.round(deposit?.amount * 100),
            currency: `${deposit?.countryCurrency.toLowerCase()}`,
            customer: customer.id,
            receipt_email: token.email,
            description: `${deposit.description}`,
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
            await wallet_model_1.default.create([
                {
                    user: user._id,
                    amount: deposit?.amount,
                    deposit_method: "Stripe"
                }
            ], { session });
            await session.commitTransaction();
            return res.status(200).json({
                error: false,
                msg: 'Deposit successful, thanks'
            });
        }
        return res.status(400).json({
            error: true,
            msg: 'Deposit Failed'
        });
    }
    catch (error) {
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
exports.stripeWallet = stripeWallet;
// paypal Wallet
const paypalWallet = async (req, res, next) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { details, amount } = req.body;
        const { user } = res.locals;
        const paypalOrder = await (0, paypal_api_1.getOrderDetails)(details?.orderID);
        if ((paypalOrder?.status === 'COMPLETED') && (details?.orderID === paypalOrder?.id)) {
            await wallet_model_1.default.create([
                {
                    user: user._id,
                    amount: +paypalOrder.purchase_units[0].amount.value,
                    deposit_method: "paypal"
                }
            ], { session });
            await session.commitTransaction();
            return res.status(200).json({
                error: false,
                msg: 'Deposit successful, thanks',
            });
        }
        else {
            await session.abortTransaction();
            return res.status(400).json({
                error: true,
                msg: 'Deposit Failed'
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
exports.paypalWallet = paypalWallet;
// user wise Wallets fetch
const getWalletList = async (req, res, next) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { "amount": query.search },
                    { "deposit_method": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const balances = await wallet_model_1.default.aggregatePaginate(wallet_model_1.default.aggregate([
            {
                $match: {
                    user: new mongoose_1.default.Types.ObjectId(user._id)
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
            data: balances
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Internal server error!"
        });
    }
};
exports.getWalletList = getWalletList;
const getWalletDepositList = async (req, res, next) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    { "amount": query.search },
                    { "deposit_method": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const balances = await wallet_model_1.default.aggregatePaginate(wallet_model_1.default.aggregate([
            {
                $lookup: {
                    from: "users",
                    let: { "user": "$user" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$user"]
                                }
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
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: balances
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Internal server error!"
        });
    }
};
exports.getWalletDepositList = getWalletDepositList;
// user wise Wallets fetch for app
const getWalletListApp = async (req, res, next) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { "amount": query.search },
                    { "deposit_method": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const balances = await wallet_model_1.default.aggregate([
            {
                $match: {
                    user: new mongoose_1.default.Types.ObjectId(user._id)
                }
            },
            { $match: filter },
        ]);
        return res.status(200).json({
            error: false,
            data: { balances }
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Internal server error!"
        });
    }
};
exports.getWalletListApp = getWalletListApp;
// user wise Wallets transactions
const getWalletTransactions = async (req, res, next) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { "amount": query.search },
                    { "deposit_method": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const transactions = await payment_model_1.default.aggregatePaginate(payment_model_1.default.aggregate([
            {
                $match: {
                    user: new mongoose_1.default.Types.ObjectId(user._id),
                    payment_method: "wallet",
                    status: 'paid',
                    amount: { $gt: 0 },
                }
            },
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
                            $lookup: {
                                from: 'vehicles',
                                let: { 'vehicle': '$vehicle' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$_id', '$$vehicle']
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            name: 1,
                                            model_name: 1,
                                            images: 1,
                                        }
                                    }
                                ],
                                as: 'vehicle'
                            }
                        },
                        { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 1,
                                pickupLocation: 1,
                                dropLocation: 1,
                                distance: 1,
                                subtotal: 1,
                                total: 1,
                                coupon: 1,
                                vehicle: 1,
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
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: transactions
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Internal server error!"
        });
    }
};
exports.getWalletTransactions = getWalletTransactions;
// user wise Wallets transactions
const getWalletTransactionsApp = async (req, res, next) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { "amount": query.search },
                    { "deposit_method": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const transactions = await payment_model_1.default.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { user: new mongoose_1.default.Types.ObjectId(user._id) },
                            { $eq: ['$payment_method', 'wallet'] },
                            { $eq: ['$status', 'paid'] },
                            { $gt: ["$amount", 0] },
                        ]
                    }
                }
            },
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
                            $lookup: {
                                from: 'vehicles',
                                let: { 'vehicle': '$vehicle' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$_id', '$$vehicle']
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            name: 1,
                                            model_name: 1,
                                            images: 1,
                                        }
                                    }
                                ],
                                as: 'vehicle'
                            }
                        },
                        { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 1,
                                pickupLocation: 1,
                                dropLocation: 1,
                                distance: 1,
                                subtotal: 1,
                                total: 1,
                                coupon: 1,
                                vehicle: 1,
                            }
                        }
                    ],
                    as: 'trip'
                }
            },
            { $unwind: { path: '$trip', preserveNullAndEmptyArrays: true } },
            { $match: filter },
        ]);
        return res.status(200).json({
            error: false,
            data: { transactions }
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Internal server error!"
        });
    }
};
exports.getWalletTransactionsApp = getWalletTransactionsApp;
// user's wallet short brief
const getUserWalletShortInfo = async (req, res, next) => {
    try {
        const { user } = res.locals;
        // @ts-ignore
        const balance = await wallet_model_1.default.aggregate([
            {
                $match: {
                    user: new mongoose_1.default.Types.ObjectId(user._id)
                }
            },
            {
                $group: {
                    _id: {
                        user: '$user'
                    },
                    user: { $first: "$user" },
                    deposits: { $sum: "$amount" }
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    let: { 'user': '$user' },
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
                                total: { $sum: "$amount" }
                            }
                        },
                    ],
                    as: 'spent'
                }
            },
            { $unwind: { path: '$spent', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    deposits: { $ifNull: ["$deposits", 0] },
                    spent: { $ifNull: ["$spent.total", 0] },
                    currentBalance: { $ifNull: [{ $subtract: ["$deposits", "$spent.total"] }, "$deposits"] }
                }
            }
        ]);
        return res.status(200).json({
            error: false,
            data: { ...balance[0] }
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.getUserWalletShortInfo = getUserWalletShortInfo;
// delete Wallet
const delWallet = async (req, res, next) => {
    try {
        const { query } = req;
        await wallet_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Wallet Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.delWallet = delWallet;
//# sourceMappingURL=wallet.controller.js.map