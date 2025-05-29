"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delWithdraw = exports.getWithdraw = exports.getWithdraws = exports.updateWithdraw = exports.postWithdraw = void 0;
const withdraw_model_1 = __importDefault(require("../models/withdraw.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const driver_balance_model_1 = __importDefault(require("../models/driver_balance.model"));
const crypto_1 = __importDefault(require("crypto"));
// post Withdraw
const postWithdraw = async (req, res, next) => {
    try {
        const { body } = req;
        const { user } = res.locals;
        const driverBalance = await driver_balance_model_1.default.aggregate([
            {
                $match: {
                    driver: user?._id
                },
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
                $lookup: {
                    from: 'withdraws',
                    let: { 'driver': '$driver' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$by", "$$driver"] },
                                        { $eq: ["$approved", false] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: 'pending'
                }
            },
            {
                $project: {
                    remaining_balance: { $ifNull: [{ $subtract: ["$amount", "$withdraw.amount"] }, "$amount"] },
                    pending: { $size: "$pending" },
                }
            }
        ]);
        if (driverBalance[0]?.pending > 0) {
            return res.status(200).json({
                error: true,
                msg: 'Already pending a withdraw request, please wait...',
            });
        }
        if (driverBalance[0]?.remaining_balance >= +body.amount && +body.amount > 0) {
            const transaction_id = crypto_1.default.randomBytes(4).toString('hex') + (new Date()).getTime();
            const user_response = await withdraw_model_1.default.create({
                by: user._id,
                amount: +body.amount,
                trx_id: transaction_id,
                description: body.description,
                payment_accept: body.payment_accept,
                invoice: body.invoice
            });
            return res.status(200).json({
                error: false,
                msg: 'Withdraw request success, we will notify you soon',
                // data: user_response
                data: driverBalance
            });
        }
        if (+body.amount === 0) {
            return res.status(200).json({
                error: true,
                msg: 'Amount 0 or less is not acceptable',
            });
        }
        return res.status(200).json({
            error: true,
            msg: 'You have no enough balance',
        });
    }
    catch (error) {
        console.log('error : ', error);
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.postWithdraw = postWithdraw;
const updateWithdraw = async (req, res, next) => {
    try {
        const { body } = req;
        if (!!body?._id) {
            await withdraw_model_1.default.findByIdAndUpdate(body?._id, {
                $set: {
                    approved: body.approved,
                    status: body.status,
                }
            });
            return res.status(200).json({
                error: false,
                msg: "Updated success"
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.updateWithdraw = updateWithdraw;
const getWithdraws = async (req, res, next) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { "user.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "user.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { status: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "amount": +query.search },
                ]
            };
        }
        let isApproved;
        if (!!query?.approved) {
            // @ts-ignore
            if (query?.approved === 'true') {
                isApproved = true;
            }
            else {
                isApproved = false;
            }
        }
        // @ts-ignore
        const withdraws = await withdraw_model_1.default.aggregatePaginate(withdraw_model_1.default.aggregate([
            ...(!!query?.status ? [
                {
                    $match: { status: query.status }
                },
            ] : []),
            ...(!!query?.approved ? [
                {
                    $match: { approved: isApproved }
                },
            ] : []),
            ...((!!user?._id && user?.role === 'driver') ? [
                {
                    $match: {
                        by: new mongoose_1.default.Types.ObjectId(user?._id)
                    }
                },
            ] : []),
            ...((!!user?._id && user?.role === 'admin') ? [
                {
                    $match: {}
                },
            ] : []),
            {
                $lookup: {
                    from: 'users',
                    let: { 'by': '$by' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$by'],
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
                        },
                    ],
                    as: 'by'
                }
            },
            { $unwind: { path: '$by', preserveNullAndEmptyArrays: true } },
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
        });
        return res.status(200).json({
            error: false,
            data: withdraws
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.getWithdraws = getWithdraws;
const getWithdraw = async (req, res, next) => {
    try {
        const { query } = req;
        // @ts-ignore
        const withdraw = await withdraw_model_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(query._id)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { 'by': '$by' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$by'],
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
                        },
                    ],
                    as: 'by'
                }
            },
            { $unwind: { path: '$by', preserveNullAndEmptyArrays: true } },
        ]);
        return res.status(200).json({
            error: false,
            data: withdraw[0]
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.getWithdraw = getWithdraw;
// delete Withdraw
const delWithdraw = async (req, res, next) => {
    try {
        const { query } = req;
        await withdraw_model_1.default.findByIdAndDelete(query._id);
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
exports.delWithdraw = delWithdraw;
//# sourceMappingURL=withdraw.controller.js.map