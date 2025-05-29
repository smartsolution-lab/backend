"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOngoingTrip = exports.delTripRequest = exports.getTripRequestByTripRequestId = exports.getDriverTripRequest = exports.getTripRequestList = exports.tripDataFetchByDriverSocketResponse = exports.tripDataFetchByUserSocketResponse = exports.tripRequestCancel = exports.tripRequestUpdateByDriver = exports.tripRequestUpdateByUser = exports.tripRequest = void 0;
const trip_request_model_1 = __importDefault(require("../models/trip_request.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user.model"));
const vehicle_model_1 = __importDefault(require("../models/vehicle.model"));
const trip_cancel_model_1 = __importDefault(require("../models/trip_cancel.model"));
// post TripRequest
const tripRequest = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { body } = req;
        const { user } = res.locals;
        delete body._id;
        const newTripRequest = await trip_request_model_1.default.create({ ...body });
        const trip = await trip_request_model_1.default.aggregate([
            {
                $match: { _id: newTripRequest?._id }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { "user": "$user" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$user"] } } },
                        { $project: { _id: 1, name: 1, first_name: 1, middle_name: 1, last_name: 1, email: 1, phone: 1, image: 1 } }
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
                        { $project: { _id: 1, name: 1, first_name: 1, middle_name: 1, last_name: 1, email: 1, phone: 1, image: 1 } }
                    ],
                    as: 'driver'
                }
            },
            { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
        ]);
        for (let socket_id of Object.keys(socketIds)) {
            // @ts-ignore
            if (socketIds[socket_id] === trip[0]?.driver?._id?.toString()) {
                await io.to(socket_id).emit('user_msg', trip[0]);
            }
        }
        return res.status(200).json({
            error: false,
            msg: 'Trip request successful',
            data: trip[0]
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.tripRequest = tripRequest;
// update ride by user
const tripRequestUpdateByUser = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { body } = req;
        const { user } = res.locals;
        const updatedTripRequest = await trip_request_model_1.default.findByIdAndUpdate(body._id, { $set: body }, {
            new: true,
            runValidators: true
        })
            .populate('user', 'name email phone image')
            .populate('driver', 'name email phone image');
        for (let socket_id of Object.keys(socketIds)) {
            // @ts-ignore
            if (socketIds[socket_id] === updatedTripRequest?.driver?._id?.toString()) {
                await io.to(socket_id).emit('user_msg', updatedTripRequest);
            }
        }
        return res.status(200).json({
            error: false,
            msg: 'Successfully updated',
            data: updatedTripRequest
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.tripRequestUpdateByUser = tripRequestUpdateByUser;
// update ride by driver
const tripRequestUpdateByDriver = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { body } = req;
        const { user } = res.locals;
        const updatedTripRequest = await trip_request_model_1.default.findByIdAndUpdate(body._id, { $set: body }, {
            new: true,
            runValidators: true
        })
            .populate('driver', 'name email phone image')
            .populate('user', 'name email phone image')
            .populate('vehicle', 'name model_name images');
        // driver rating
        let match = await vehicle_model_1.default.aggregate([
            {
                $match: {
                    _id: updatedTripRequest?.vehicle._id
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'driver',
                    foreignField: "_id",
                    as: 'driver'
                }
            },
            { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'driver_ratings',
                    let: { "driver": "$driver._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$driver", "$$driver"] }
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                let: { "user": "$user" },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ["$_id", "$$user"] } }
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
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        {
                            $group: {
                                _id: null,
                                driver: { $first: "$driver" },
                                count: { $count: {} },
                                rating: { $sum: "$rating" },
                                reviews: { $push: { review: "$comment", user: "$user", rating: '$rating' } }
                            }
                        },
                        {
                            $project: {
                                average_rating: { $round: [{ $divide: ["$rating", "$count"] }, 2] },
                                total_reviews: { $ifNull: ["$count", 0] },
                            }
                        }
                    ],
                    as: 'rating'
                }
            },
            { $unwind: { path: '$rating', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    rating: { $ifNull: ["$rating", {}] },
                    position: 1,
                    dist: 1,
                }
            },
        ]);
        for (let socket_id of Object.keys(socketIds)) {
            // @ts-ignore
            if (socketIds[socket_id] === updatedTripRequest?.user?._id?.toString()) {
                await io.to(socket_id).emit('driver_msg', {
                    // @ts-ignore
                    ...updatedTripRequest?._doc,
                    rider_info: match[0]
                });
            }
        }
        return res.status(200).json({
            error: false,
            msg: 'Successfully updated',
            data: {
                // @ts-ignore
                ...updatedTripRequest?._doc,
                rider_info: match[0]
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.tripRequestUpdateByDriver = tripRequestUpdateByDriver;
const tripRequestCancel = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { body } = req;
        const { user } = res.locals;
        let trip = {};
        if (user?.role === 'user') {
            trip = await trip_request_model_1.default.findOne({
                _id: new mongoose_1.default.Types.ObjectId(body.trip_id),
                user: user?._id
            });
            // @ts-ignore
            if (!trip?._id) {
                return res.status(400).json({
                    error: true,
                    msg: 'Trip not found',
                });
            }
            // @ts-ignore
            await trip_cancel_model_1.default.create({ reason: body?.cancellation_reason, user: trip?._id, vehicle: trip?.vehicle });
            // @ts-ignore
            await trip_request_model_1.default.deleteOne({ _id: trip?._id });
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const tripObj = {
                        "driver": {
                            // @ts-ignore
                            "_id": trip?.driver,
                        },
                        status: 'cancelled'
                    };
                    // @ts-ignore
                    await io.to(socket_id).emit('user_msg', tripObj);
                }
            }
        }
        else if (user?.role === 'driver') {
            trip = await trip_request_model_1.default.findOne({
                _id: new mongoose_1.default.Types.ObjectId(body.trip_id),
                driver: user?._id
            });
            // @ts-ignore
            if (!trip?._id) {
                return res.status(400).json({
                    error: true,
                    msg: 'Trip not found',
                });
            }
            // @ts-ignore
            await trip_cancel_model_1.default.create({ reason: body?.cancellation_reason, user: user?._id, vehicle: trip?.vehicle });
            // @ts-ignore
            await trip_request_model_1.default.deleteOne({ _id: trip?._id });
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const tripObj = {
                        "driver": {
                            // @ts-ignore
                            "_id": trip?.driver,
                        },
                        status: 'cancelled'
                    };
                    // @ts-ignore
                    await io.to(socket_id).emit('driver_msg', tripObj);
                }
            }
        }
        return res.status(200).json({
            error: false,
            msg: 'Successfully cancelled',
            data: trip
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.tripRequestCancel = tripRequestCancel;
// update ride by user
const tripDataFetchByUserSocketResponse = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { query } = req;
        const { user } = res.locals;
        const updatedTripRequest = await trip_request_model_1.default.findById(query._id)
            .populate('driver', 'name email phone image')
            .populate('user', 'name email phone image')
            .populate('vehicle', 'name model_name images');
        await io.emit('driver_msg', updatedTripRequest);
        return res.status(200).json({
            error: false,
            msg: 'Success',
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.tripDataFetchByUserSocketResponse = tripDataFetchByUserSocketResponse;
// update ride by driver
const tripDataFetchByDriverSocketResponse = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { query } = req;
        const { user } = res.locals;
        const updatedTripRequest = await trip_request_model_1.default.findById(query._id)
            .populate('driver', 'name email phone image')
            .populate('user', 'name email phone image')
            .populate('vehicle', 'name model_name images');
        await io.emit('user_msg', updatedTripRequest);
        return res.status(200).json({
            error: false,
            msg: 'Success',
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.tripDataFetchByDriverSocketResponse = tripDataFetchByDriverSocketResponse;
// get TripRequests
const getTripRequestList = async (req, res, next) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    { "user.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "user.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "driver.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "driver.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { due: { $gt: 0 } },
                ]
            };
        }
        // @ts-ignore
        const trips = await trip_request_model_1.default.aggregatePaginate(trip_request_model_1.default.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            ...((!!user._id && user.role === "user") ? [
                {
                    $match: {
                        "user": new mongoose_1.default.Types.ObjectId(user._id)
                    }
                },
            ] : []),
            ...((!!user._id && user.role === "driver") ? [
                {
                    $match: {
                        "driver": new mongoose_1.default.Types.ObjectId(user._id)
                    }
                },
            ] : []),
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
                    from: 'vehicles',
                    let: { "vehicle": "$vehicle" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$vehicle"] } } },
                        { $project: { _id: 1, name: 1, model_name: 1, images: 1 } }
                    ],
                    as: 'vehicle'
                }
            },
            { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
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
                        {
                            $group: {
                                _id: { trip: "$trip" },
                                rating: { $last: '$rating' },
                                comment: { $last: '$comment' },
                                createdAt: { $last: '$createdAt' },
                                active: { $last: '$active' },
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                rating: 1,
                                comment: 1,
                                createdAt: 1,
                                active: 1
                            }
                        }
                    ],
                    as: 'rating'
                }
            },
            { $unwind: { path: '$rating', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    user: 1,
                    driver: 1,
                    rating: { $ifNull: ['$rating', {}] },
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
                        $subtract: ["$total", {
                                $reduce: {
                                    input: "$payments",
                                    initialValue: 0,
                                    in: {
                                        $add: ["$$value", "$$this.amount"]
                                    }
                                }
                            }]
                    },
                }
            },
            ...(!!query.status ? [
                {
                    $match: {
                        status: query.status
                    }
                },
            ] : []),
            ...(query.search === 'due' ? [
                {
                    $match: {
                        $expr: {
                            $in: ["$status", ["accepted", "moving", "start", 'completed']]
                        }
                    }
                },
            ] : []),
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { updatedAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: trips
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.getTripRequestList = getTripRequestList;
// get TripRequests according to driver
const getDriverTripRequest = async (req, res, next) => {
    try {
        const { user } = req.locals;
        const driver = await user_model_1.default.findById(user?._id);
        if (!!driver) {
            const requests = await trip_request_model_1.default.find();
            return res.status(200).json({
                error: false,
                data: requests
            });
        }
        return res.status(404).json({
            error: true,
            data: 'invalid_user'
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'server_failed'
        });
    }
};
exports.getDriverTripRequest = getDriverTripRequest;
// get TripRequest by trip _id
const getTripRequestByTripRequestId = async (req, res, next) => {
    try {
        const { query } = req;
        // @ts-ignore
        const trip = await trip_request_model_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(query._id)
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
                    from: 'vehicles',
                    let: { "vehicle": "$vehicle" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$vehicle"] } } },
                        { $project: { _id: 1, name: 1, model_name: 1, images: 1 } }
                    ],
                    as: 'vehicle'
                }
            },
            { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
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
        return res.status(200).json({
            error: false,
            data: trip[0]
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.getTripRequestByTripRequestId = getTripRequestByTripRequestId;
// delete TripRequest
const delTripRequest = async (req, res, next) => {
    try {
        const { query } = req;
        await trip_request_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "TripRequest Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.delTripRequest = delTripRequest;
// get ongoing Trip
const getOngoingTrip = async (req, res, next) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        // @ts-ignore
        const trips = await trip_request_model_1.default.aggregate([
            ...((!!user._id && user.role === "user") ? [
                {
                    $match: {
                        "user": new mongoose_1.default.Types.ObjectId(user._id),
                        $expr: {
                            $in: ["$status", ['pending', 'accepted', "moving", "start"]]
                        }
                    }
                },
            ] : []),
            ...((!!user._id && user.role === "driver") ? [
                {
                    $match: {
                        "driver": new mongoose_1.default.Types.ObjectId(user._id),
                        $expr: {
                            $in: ["$status", ['accepted', "moving", "start"]]
                        }
                    }
                },
            ] : []),
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
                    from: 'vehicles',
                    let: { "vehicle": "$vehicle" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$vehicle"] } } },
                        { $project: { _id: 1, name: 1, model_name: 1, images: 1 } }
                    ],
                    as: 'vehicle'
                }
            },
            { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
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
                        {
                            $group: {
                                _id: { trip: "$trip" },
                                rating: { $last: '$rating' },
                                comment: { $last: '$comment' },
                                createdAt: { $last: '$createdAt' },
                                active: { $last: '$active' },
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                rating: 1,
                                comment: 1,
                                createdAt: 1,
                                active: 1
                            }
                        }
                    ],
                    as: 'rating'
                }
            },
            { $unwind: { path: '$rating', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    user: 1,
                    driver: 1,
                    rating: { $ifNull: ['$rating', {}] },
                    // pickupLocation: {
                    //     lat: {$toString: "$pickupLocation.lat"},
                    //     lng: {$toString: "$pickupLocation.lng"},
                    // },
                    // dropLocation: {
                    //     lat: {$toString: "$dropLocation.lat"},
                    //     lng: {$toString: "$dropLocation.lng"},
                    // },
                    pickupLocation: 1,
                    dropLocation: 1,
                    distance: { $toString: "$distance" },
                    subtotal: { $toString: "$subtotal" },
                    vat: { $toString: "$vat" },
                    total: { $toString: "$total" },
                    discount: {
                        amount: { $toString: "$discount.amount" },
                        code: { $toString: "$discount.code" },
                    },
                    payment_method: 1,
                    payments: 1,
                    paid: {
                        $toString: {
                            $reduce: {
                                input: "$payments",
                                initialValue: 0,
                                in: {
                                    $add: ["$$value", "$$this.amount"]
                                }
                            }
                        }
                    },
                    vehicle: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    due: {
                        $toString: {
                            $subtract: ["$total", {
                                    $reduce: {
                                        input: "$payments",
                                        initialValue: 0,
                                        in: {
                                            $add: ["$$value", "$$this.amount"]
                                        }
                                    }
                                }]
                        }
                    },
                }
            },
            { $sort: { updatedAt: -1 } }
        ]);
        if (trips?.length === 0) {
            return res.status(200).json({
                error: true,
                msg: 'Not found'
            });
        }
        return res.status(200).json({
            error: false,
            data: trips[0]
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.getOngoingTrip = getOngoingTrip;
//# sourceMappingURL=trip_request.controller.js.map