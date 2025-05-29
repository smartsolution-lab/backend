import TripRequest from "../models/trip_request.model";
import DriverBalance from "../models/driver_balance.model";
import Withdraw from "../models/withdraw.model";
import mongoose from "mongoose";
import Payment from "../models/payment.model";
import moment from "moment/moment";
import User from "../models/user.model";


export const getDriverDashBoardInfo = async (req, res) => {
    try {
        const {user} = res.locals;
        console.log("dashboard: ", user)
        // @ts-ignore
        let balance = await DriverBalance.aggregate([
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
                $lookup: {
                    from: 'trip_requests',
                    let: {'driver': '$driver'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$driver", "$$driver"]},
                                        {$eq: ["$status", "completed"]},
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_distance: {$sum: "$distance"},
                                total_trip_completed: {$count: {}},
                            }
                        }
                    ],
                    as: 'trips'
                }
            },
            {$unwind: {path: '$trips', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'trip_requests',
                    let: {'driver': '$driver'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$driver", "$$driver"]},
                                        {$eq: ["$status", "declined"]},
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_distance: {$sum: "$distance"},
                                total_trip_cancelled: {$count: {}},
                            }
                        }
                    ],
                    as: 'canceled_trips'
                }
            },
            {$unwind: {path: '$canceled_trips', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'driver_ratings',
                    let: {"driver": "$driver"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ["$driver", "$$driver"]}
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                let: {"user": "$user"},
                                pipeline: [
                                    {
                                        $match: {$expr: {$eq: ["$_id", "$$user"]}}
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            name: 1,
                                            email: 1,
                                            phone: 1,
                                            createdAt: 1
                                        }
                                    }
                                ],
                                as: 'user'
                            }
                        },
                        {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
                        {
                            $group: {
                                _id: null,
                                driver: {$first: "$driver"},
                                count: {$count: {}},
                                rating: {$sum: "$rating"},
                                reviews: {$push: {review: "$comment", user: "$user", rating: '$rating'}}
                            }
                        },
                        {
                            $project: {
                                average_rating: {$round: [{$divide: ["$rating", "$count"]}, 2]},
                                total_reviews: {$ifNull: ["$count", 0]},
                            }
                        }
                    ],
                    as: 'rating'
                }
            },
            {$unwind: {path: '$rating', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "users",
                    localField: "driver",
                    foreignField: "_id",
                    as: "driver"
                }
            },
            {$unwind: {path: "$driver", preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    total_earning: {$trunc: [{$ifNull: ["$amount", 0]}, 2]},
                    total_withdraw: {$trunc: [{$ifNull: ["$withdraw.amount", 0]}, 2]},
                    remaining_balance: {$trunc: [{$ifNull: [{$subtract: ["$amount", "$withdraw.amount"]}, "$amount"]}, 2]},
                    total_distance: {$round: [{$ifNull: ["$trips.total_distance", 0]}, 2]},
                    total_trip_completed: {$ifNull: ["$trips.total_trip_completed", 0]},
                    total_trip_cancelled: {$ifNull: ["$canceled_trips.total_trip_cancelled", 0]},
                    rating: 1,
                    driver: {
                        _id: "$driver._id",
                        name: "$driver.name",
                        email: "$driver.email",
                        phone: "$driver.phone",
                        image: "$driver.image",
                    }
                }
            }
        ]);

        if(balance?.length === 0) {
            const userData = await User.findOne({_id: user?._id});
            balance = [{
                "driver": {
                    "_id": userData?._id,
                    "name": userData?.name,
                    "email": userData?.email,
                    "phone": userData?.phone,
                    "image": userData?.image
                },
                "rating": {
                    "_id": null,
                    "average_rating": 0,
                    "total_reviews": 0
                },
            }]
        }

        return res.status(200).json({
            error: false,
            data: balance[0]
        });
    } catch (e) {
        return res.status(500).json({
            error: true,
            data: "Internal Server error"
        })
    }
}

export const getUserDashBoardInfo = async (req, res) => {
    try {
        const {user} = res.locals;
        // @ts-ignore
        const balance = await Payment.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(user?._id),
                    status: 'paid',
                }
            },
            {
                $group: {
                    _id: null,
                    total_payment: {$sum: "$amount"},
                    user: {$first: '$user'}
                }
            },
            {
                $lookup: {
                    from: 'trip_requests',
                    let: {'user': '$user'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$user", "$$user"]},
                                        {$eq: ["$status", "completed"]},
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_distance: {$sum: "$distance"},
                                total_trip_completed: {$count: {}},
                            }
                        }
                    ],
                    as: 'trips'
                }
            },
            {$unwind: {path: '$trips', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    total_payment: {$trunc: [{$ifNull: ["$total_payment", 0]}, 2]},
                    total_distance: {$round: [{$ifNull: ["$trips.total_distance", 0]}, 2]},
                    total_trip_completed: {$ifNull: ["$trips.total_trip_completed", 0]},
                }
            }
        ]);

        return res.status(200).json({
            error: false,
            data: balance[0] || {}
        });
    } catch (e) {
        return res.status(500).json({
            error: true,
            data: "Internal Server error"
        })
    }
}

export const getAdminDashBoardInfo = async (req, res) => {
    try {
        const {user} = res.locals;
        // @ts-ignore
        const balance = await Payment.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            {status: 'paid'},
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total_payment: {$sum: "$amount"},
                }
            },
            {
                $lookup: {
                    from: 'users',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$role", "driver"]},
                                        {$eq: ["$verified", true]},
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                verified_driver: {$count: {}},
                            }
                        }
                    ],
                    as: 'verified_driver'
                }
            },
            {$unwind: {path: '$verified_driver', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'users',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$role", "user"]},
                                        {$eq: ["$verified", true]},
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                verified_user: {$count: {}},
                            }
                        }
                    ],
                    as: 'verified_user'
                }
            },
            {$unwind: {path: '$verified_user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'vehicles',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$approved", true],
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                approved_vehicles: {$count: {}},
                            }
                        }
                    ],
                    as: 'approved_vehicles'
                }
            },
            {$unwind: {path: '$approved_vehicles', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'trip_requests',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$status", "completed"],
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total_trip_completed: {$count: {}},
                            }
                        }
                    ],
                    as: 'total_trip_completed'
                }
            },
            {$unwind: {path: '$total_trip_completed', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'tickets',
                    pipeline: [
                        {
                            $group: {
                                _id: null,
                                total_complain_received: {$count: {}},
                            }
                        }
                    ],
                    as: 'tickets'
                }
            },
            {$unwind: {path: '$tickets', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    total_payment: {$trunc: [{$ifNull: ["$total_payment", 0]}, 2]},
                    verified_driver: {$ifNull: ["$verified_driver.verified_driver", 0]},
                    verified_user: {$ifNull: ["$verified_user.verified_user", 0]},
                    total_trip_completed: {$ifNull: ["$total_trip_completed.total_trip_completed", 0]},
                    approved_vehicles: {$ifNull: ["$approved_vehicles.approved_vehicles", 0]},
                    total_complain_received: {$ifNull: ["$tickets.total_complain_received", 0]},
                }
            }
        ]);
        return res.status(200).json({
            error: false,
            data: balance[0]
        });
    } catch (e) {
        return res.status(500).json({
            error: true,
            data: "Internal Server error"
        })
    }
}

export const getDriverDashBoardGraphData = async (req, res) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        // @ts-ignore
        const balance = await DriverBalance.aggregate([
            {
                $match: {
                    driver: user?._id,
                    createdAt: {
                        $gte: moment(query.start).toDate(),
                        $lte: moment(query.end).toDate(),
                    }
                }
            },
            {
                $group: {
                    _id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
                    amount: {$sum: "$amount"},
                    createdAt: {$first: "$createdAt"},
                }
            },
            {
                $project: {
                    _id: null,
                    earnings: {$trunc: [{$ifNull: ["$amount", 0]}, 2]},
                    date: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
                    date_time: "$createdAt"
                }
            },
            {
                $sort: {date: 1}
            },
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

export const getAdminDashBoardEarningGraphData = async (req, res) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        // @ts-ignore
        const balance = await Payment.aggregate([
            {
                $match: {
                    status: 'paid',
                    createdAt: {
                        $gte: moment(query.start).toDate(),
                        $lte: moment(query.end).toDate(),
                    }
                }
            },
            {
                $group: {
                    _id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
                    earning: {$sum: "$amount"},
                    createdAt: {$first: "$createdAt"},
                    // trip: {$first: "$trip"},
                }
            },
            // {
            //     $lookup: {
            //         from: 'trip_requests',
            //         let: {"trip": "$trip"},
            //         pipeline: [
            //             {$match: {$expr: {$eq: ["$_id", "$$trip"]}}}
            //         ],
            //         as: 'trip'
            //     }
            // },
            // {$unwind: {path: '$trip', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    // trip: {
                    //     total: "$trip.total",
                    //     subtotal: "$trip.subtotal",
                    //     vat: "$trip.vat",
                    // },
                    // earning: {
                    //     $switch: {
                    //         branches: [
                    //             {
                    //                 case: {$eq: ["$trip.total", "$earning"]}, then: {$ifNull: ["$trip.vat", 0]}
                    //             },
                    //         ],
                    //         default: 0
                    //     },
                    // },
                    earning: 1,
                    date: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
                    date_time: "$createdAt",
                    received_amount: "$earning"
                }
            },
            {
                $sort: {date: 1}
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

export const getAdminDonutChartCompleteCancel = async (req, res) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        // @ts-ignore
        const balance = await TripRequest.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: moment(query.start).toDate(),
                        $lte: moment(query.end).toDate(),
                    }
                }
            },
            {
                $group: {
                    _id: {status: "$status"},
                    total: {$count: {}},
                    status: {$first: "$status"}
                }
            },
            {
                $project: {
                    _id: 0,
                    total: 1,
                    status: 1
                }
            }
        ]);
        let donut_labels: any = []
        let donut_series: any = []
        for (let i = 0; i < balance?.length; i++) {
            donut_labels.push(balance[i].status)
            donut_series.push(balance[i].total)
        }
        const data = {
            labels: donut_labels,
            series: donut_series,
        }

        return res.status(200).json({
            error: false,
            data: data
        });
    } catch (e) {
        return res.status(500).json({
            error: true,
            data: "Internal Server error"
        })
    }
}

export const getUserExpensesGraphData = async (req, res) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        // @ts-ignore
        const balance = await Payment.aggregate([
            {
                $match: {
                    user: user?._id,
                    createdAt: {
                        $gte: moment(query.start).toDate(),
                        $lte: moment(query.end).toDate(),
                    }
                }
            },
            {
                $group: {
                    _id: {trip: "$trip"},
                    expense_amount: {$sum: "$amount"},
                    createdAt: {$first: "$createdAt"},
                    trip: {$first: "$trip"},
                }
            },
            {
                $lookup: {
                    from: 'trip_requests',
                    let: {"trip": "$trip"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$trip"]}}}
                    ],
                    as: 'trip'
                }
            },
            {$unwind: {path: '$trip', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    trip: {
                        total: "$trip.total",
                        subtotal: "$trip.subtotal",
                        vat: "$trip.vat",
                    },
                    expense_amount: {$ifNull: ["$expense_amount", 0]},
                    date: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
                    date_time: "$createdAt",
                }
            },
            {
                $sort: {date: 1}
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