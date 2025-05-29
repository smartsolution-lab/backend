"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotification = exports.postNotification = exports.getAllNotification = exports.getNotification = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const getNotification = async (req, res, next) => {
    try {
        const decode = res.locals.user;
        const _id = decode._id.toHexString();
        // @ts-ignore
        if (decode._id) {
            const data = await notification_model_1.default.aggregate([
                {
                    $match: {
                        user_id: _id
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $group: {
                        _id: "$user_id",
                        total_unread_notifications: {
                            $sum: {
                                $cond: [{ $eq: ["$read", false] }, 1, 0]
                            }
                        },
                        notifications: {
                            $push: {
                                _id: "$_id",
                                title: "$title",
                                body: "$body",
                                read: "$read",
                                type: "$type",
                                data: "$data",
                            }
                        }
                    },
                },
            ]);
            return res.status(200).json({
                error: false,
                msg: "Success",
                data: data[0]
            });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(300).json({
            error: true,
            msg: "Error in request",
        });
    }
};
exports.getNotification = getNotification;
const getAllNotification = async (req, res, next) => {
    const { query } = req;
    try {
        const decode = res.locals.user;
        const _id = decode._id.toHexString();
        // @ts-ignore
        let allNotification = await notification_model_1.default.aggregatePaginate(notification_model_1.default.aggregate([
            {
                $match: {
                    user_id: _id
                }
            },
            {
                $group: {
                    _id: "$user_id",
                    total_unread_notifications: {
                        $sum: {
                            $cond: [{ $eq: ["$read", false] }, 1, 0]
                        }
                    },
                    notifications: {
                        $push: {
                            _id: "$_id",
                            title: "$title",
                            body: "$body",
                            read: "$read",
                            type: "$type",
                            data: "$data",
                        }
                    }
                },
            },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            msg: "Success",
            data: allNotification
        });
    }
    catch (e) {
        console.log(e);
        return res.status(300).json({
            error: true,
            msg: "Error in request",
        });
    }
};
exports.getAllNotification = getAllNotification;
const postNotification = async (req, res, next) => {
    const { body } = req;
    try {
        const data = await notification_model_1.default.create(body);
        return res.status(200).json({
            error: false,
            msg: "Notification Created",
        });
    }
    catch (e) {
        console.log(e);
        return res.status(300).json({
            error: true,
            msg: "Error in request",
        });
    }
};
exports.postNotification = postNotification;
const updateNotification = async (req, res, next) => {
    const { body } = req;
    try {
        if (body._id) {
            await notification_model_1.default.findByIdAndUpdate(body._id, { read: true });
            return res.status(200).json({
                error: false,
                msg: "Notifictaion Updated"
            });
        }
        else {
            return res.status(300).json({
                error: true,
                msg: "Error in request"
            });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(300).json({
            error: true,
            msg: "Error in request"
        });
    }
};
exports.updateNotification = updateNotification;
//# sourceMappingURL=notification.controller.js.map