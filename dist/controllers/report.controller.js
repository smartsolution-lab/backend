"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyReport = exports.getDriverReport = exports.getUserReport = void 0;
const moment_1 = __importDefault(require("moment"));
const user_model_1 = __importDefault(require("../models/user.model"));
const trip_request_model_1 = __importDefault(require("../models/trip_request.model"));
// get Report
const getUserReport = async (req, res, next) => {
    try {
        let { query } = req;
        let verify;
        if (!!query.verified) {
            verify = query?.verified === 'true';
        }
        let data = await user_model_1.default.aggregate([
            {
                $match: {
                    role: "user",
                    verified: verify,
                    createdAt: {
                        $gte: (0, moment_1.default)(query.start).toDate(),
                        $lte: (0, moment_1.default)(query.end).toDate(),
                    }
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    let: { "user": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$user", "$$user"] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_spend: { $sum: "$amount" },
                                trips: { $addToSet: "$trip" }
                            }
                        }
                    ],
                    as: "trip"
                }
            },
            { $unwind: { path: '$trip', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    date: "$createdAt",
                    name: 1,
                    email: 1,
                    phone: 1,
                    verified: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$verified", true] }, then: "Yes" },
                            ],
                            default: "No"
                        }
                    },
                    total_spend: { $ifNull: ["$trip.total_spend", 0] },
                    trips_completed: { $size: { $ifNull: ["$trip.trips", []] } },
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);
        if (data?.length > 0) {
            return res.status(200).send({
                error: false,
                msg: 'Successfully gets report',
                len: data.length,
                data: data,
            });
        }
        return res.status(404).send({
            error: true,
            msg: 'No report found',
            data: data
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getUserReport = getUserReport;
// driver report
const getDriverReport = async (req, res, next) => {
    try {
        let { query } = req;
        let verify;
        if (!!query.verified) {
            verify = query?.verified === 'true';
        }
        let filter = {
            $and: [
                { $gte: ["$createdAt", (0, moment_1.default)(query.start).toDate()] },
                { $lte: ["$createdAt", (0, moment_1.default)(query.end).toDate()] },
            ]
        };
        let data = await trip_request_model_1.default.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: (0, moment_1.default)(query.start).toDate(),
                        $lte: (0, moment_1.default)(query.end).toDate(),
                    },
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: { driver: "$driver" },
                    total_amount: { $sum: "$total" },
                    total_trip: { $count: {} },
                    total_distance: { $sum: "$distance" },
                    driver: { $first: "$driver" },
                    firstCreatedAt: { $first: "$createdAt" },
                    lastCreatedAt: { $last: "$createdAt" },
                }
            },
            {
                $lookup: {
                    from: "driver_balances",
                    let: { "driver": "$driver" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$driver", "$$driver"] },
                                        { $gte: ["$createdAt", (0, moment_1.default)(query.start).toDate()] },
                                        { $lte: ["$createdAt", (0, moment_1.default)(query.end).toDate()] },
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_earning: { $sum: "$amount" },
                            }
                        }
                    ],
                    as: 'driver_balance'
                }
            },
            { $unwind: { path: "$driver_balance", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "withdraws",
                    let: { "by": "$driver" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$by", "$$by"] },
                                        { $eq: ["$approved", true] },
                                        { $gte: ["$createdAt", (0, moment_1.default)(query.start).toDate()] },
                                        { $lte: ["$createdAt", (0, moment_1.default)(query.end).toDate()] },
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_withdraw: { $sum: "$amount" },
                            }
                        }
                    ],
                    as: 'driver_withdraw'
                }
            },
            { $unwind: { path: "$driver_withdraw", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "driver_balances",
                    let: { "driver": "$driver" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$driver", "$$driver"],
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_earning: { $sum: "$amount" },
                            }
                        }
                    ],
                    as: 'net_driver_balance'
                }
            },
            { $unwind: { path: "$net_driver_balance", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "withdraws",
                    let: { "by": "$driver" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$by", "$$by"],
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_withdraw: { $sum: "$amount" },
                            }
                        }
                    ],
                    as: 'net_driver_withdraw'
                }
            },
            { $unwind: { path: "$net_driver_withdraw", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "driver",
                    foreignField: "_id",
                    as: "driver"
                }
            },
            { $unwind: { path: "$driver", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    from_date: "$firstCreatedAt",
                    to_date: "$lastCreatedAt",
                    name: "$driver.name",
                    email: "$driver.email",
                    phone: "$driver.phone",
                    verified: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$verified", true] }, then: "Yes" },
                                { case: { $eq: ["$verified", false] }, then: "No" },
                            ],
                            default: "No"
                        }
                    },
                    total_earning: { $trunc: [{ $ifNull: ["$driver_balance.total_earning", 0] }, 2] },
                    total_withdraw: { $trunc: [{ $ifNull: ["$driver_withdraw.total_withdraw", 0] }, 2] },
                    remaining_balance: { $trunc: [{ $ifNull: [{ $subtract: ["$net_driver_balance.total_earning", "$net_driver_withdraw.total_withdraw"] }, 0] }, 2] },
                    total_distance: { $trunc: [{ $ifNull: ["$total_distance", 0] }, 2] },
                    total_trip_completed: { $ifNull: ["$total_trip", 0] },
                }
            },
            {
                $sort: {
                    from_date: 1
                }
            }
        ]);
        if (data?.length > 0) {
            return res.status(200).send({
                error: false,
                msg: 'Successfully gets report',
                len: data.length,
                data: data,
            });
        }
        return res.status(404).send({
            error: true,
            msg: 'No report found',
            data: data
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getDriverReport = getDriverReport;
// company report
const getCompanyReport = async (req, res, next) => {
    try {
        let { query } = req;
        let data = await trip_request_model_1.default.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ["$status", 'completed'] },
                            { $gte: ["$createdAt", (0, moment_1.default)(query.start).toDate()] },
                            { $lte: ["$createdAt", (0, moment_1.default)(query.end).toDate()] },
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total_revenue: { $sum: "$vat" },
                }
            },
            {
                $lookup: {
                    from: "users",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$role", "driver"] },
                                        { $eq: ["$verified", true] },
                                        { $gte: ["$createdAt", (0, moment_1.default)(query.start).toDate()] },
                                        { $lte: ["$createdAt", (0, moment_1.default)(query.end).toDate()] },
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_driver: { $count: {} },
                            }
                        },
                    ],
                    as: 'driver'
                }
            },
            { $unwind: { path: "$driver", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$role", "user"] },
                                        { $eq: ["$verified", true] },
                                        { $gte: ["$createdAt", (0, moment_1.default)(query.start).toDate()] },
                                        { $lte: ["$createdAt", (0, moment_1.default)(query.end).toDate()] },
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_user: { $count: {} },
                            }
                        },
                    ],
                    as: 'user'
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "withdraws",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$approved", true] },
                                        { $gte: ["$createdAt", (0, moment_1.default)(query.start).toDate()] },
                                        { $lte: ["$createdAt", (0, moment_1.default)(query.end).toDate()] },
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_withdraw_received: { $sum: "$amount" },
                            }
                        }
                    ],
                    as: 'withdraw_received'
                }
            },
            { $unwind: { path: "$withdraw_received", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "payments",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $gte: ["$createdAt", (0, moment_1.default)(query.start).toDate()] },
                                        { $lte: ["$createdAt", (0, moment_1.default)(query.end).toDate()] },
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_payment_received: { $sum: "$amount" },
                            }
                        }
                    ],
                    as: 'payment_received'
                }
            },
            { $unwind: { path: "$payment_received", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "vehicles",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $gte: ["$createdAt", (0, moment_1.default)(query.start).toDate()] },
                                        { $lte: ["$createdAt", (0, moment_1.default)(query.end).toDate()] },
                                        { $eq: ["$approved", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $count: {} },
                            }
                        }
                    ],
                    as: 'vehicle'
                }
            },
            { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    date: "$createdAt",
                    new_user: { $ifNull: ["$user.total_user", 0] },
                    new_driver: { $ifNull: ["$driver.total_driver", 0] },
                    withdraw_received: { $trunc: [{ $ifNull: ["$withdraw_received.total_withdraw_received", 0] }, 2] },
                    payment_received: { $trunc: [{ $ifNull: ["$payment_received.total_payment_received", 0] }, 2] },
                    company_revenue: { $trunc: [{ $ifNull: ["$total_revenue", 0] }, 2] },
                    new_vehicle: { $ifNull: ["$vehicle.total", 0] },
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);
        if (data?.length > 0) {
            return res.status(200).send({
                error: false,
                msg: 'Successfully gets report',
                len: data.length,
                data: data,
            });
        }
        return res.status(404).send({
            error: true,
            msg: 'No report found',
            data: data
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getCompanyReport = getCompanyReport;
//# sourceMappingURL=report.controller.js.map