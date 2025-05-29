"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingJon = exports.getNotificationStatus = exports.postNotificationStatus = exports.postNotification = exports.getNotification = void 0;
const push_1 = require("../utils/push_notification/push");
const user_model_1 = __importDefault(require("../models/user.model"));
const aggretion_1 = require("../utils/push_notification/aggretion");
const push_notificatio_model_1 = __importDefault(require("../models/push_notificatio.model"));
const settings_model_1 = __importDefault(require("../models/settings.model"));
const mongoose_1 = require("mongoose");
const getNotification = async (req, res, next) => {
    const { query } = req;
    if (query.status === 'all') {
        const data = await push_notificatio_model_1.default.find().sort({ createdAt: -1 });
        return res.status(200).json({
            error: false,
            msg: "ok",
            data: data
        });
    }
    if (query.status === 'scheduled') {
        const data = await push_notificatio_model_1.default.find({ status: 'scheduled' }).sort({ createdAt: -1 });
        return res.status(200).json({
            error: false,
            msg: "ok",
            data: data
        });
    }
    else if (query.status === 'failed') {
        const data = await push_notificatio_model_1.default.find({ status: 'failed' }).sort({ createdAt: -1 });
        return res.status(200).json({
            error: false,
            msg: "ok",
            data: data
        });
    }
    else {
        return res.status(300).json({
            error: true,
            msg: "Error in request",
        });
    }
};
exports.getNotification = getNotification;
const postNotification = async (req, res, next) => {
    if (req.body.scheduled_date) {
        //handle scheduled notification
        await push_notificatio_model_1.default.create({
            title: req.body.title,
            body: req.body.body,
            to_users: req.body.to_users,
            status: 'scheduled',
            scheduled_date: req.body.scheduled_date,
        });
        return res.status(200).json({
            error: false,
            msg: "Notification Scheduled"
        });
    }
    else {
        if (req.body.to_users === 'all_user') {
            await push_notificatio_model_1.default.create({
                title: req.body.title,
                body: req.body.body,
                to_users: 'all_user'
            });
            const data = await user_model_1.default.aggregate(aggretion_1.allUserFcmArray);
            const fcm_tokens = data[0].fcm_tokens;
            fcm_tokens.map(async (token) => {
                const response = await (0, push_1.sendNotification)(token, req.body.title, req.body.body);
                if (response) {
                }
                else {
                }
            });
            return res.status(200).json({
                error: false,
                msg: "Notification Send"
            });
        }
        else if (req.body.to_users === 'driver') {
            await push_notificatio_model_1.default.create({
                title: req.body.title,
                body: req.body.body,
                to_users: 'driver'
            });
            const data = await user_model_1.default.aggregate(aggretion_1.driverFcmArray);
            const fcm_tokens = data[0].fcm_tokens;
            fcm_tokens.map(async (token) => {
                const response = await (0, push_1.sendNotification)(token, req.body.title, req.body.body);
                if (response) {
                }
                else {
                }
            });
            return res.status(200).json({
                error: false,
                msg: "Notification Send"
            });
        }
        else if (req.body.to_users === 'user') {
            await push_notificatio_model_1.default.create({
                title: req.body.title,
                body: req.body.body,
                to_users: 'user'
            });
            const data = await user_model_1.default.aggregate(aggretion_1.userFcmArray);
            const fcm_tokens = data[0].fcm_tokens;
            fcm_tokens.map(async (token) => {
                const response = await (0, push_1.sendNotification)(token, req.body.title, req.body.body);
                if (response) {
                }
                else {
                }
            });
            return res.status(200).json({
                error: false,
                msg: "Notification Send"
            });
        }
        else if (!!req.body.to) {
            const { to } = req.body;
            const group_id = new mongoose_1.mongo.ObjectId(to);
            const data = await user_model_1.default.aggregate([
                {
                    $match: {
                        group_id: group_id
                    }
                },
            ]);
            await push_notificatio_model_1.default.create({
                title: req.body.title,
                body: req.body.body,
                group: group_id
            });
            return res.status(200).json({
                error: false,
                msg: "Notification Send"
            });
        }
        else {
            return res.status(300).json({
                error: false,
                msg: "wrong request"
            });
        }
    }
};
exports.postNotification = postNotification;
const postNotificationStatus = async (req, res, next) => {
    const { body } = req;
    const decode = res.locals.user;
    const _id = decode._id;
    if (_id) {
        //handle scheduled notification
        await user_model_1.default.findByIdAndUpdate(_id, { push_notification_status: body.status });
        return res.status(200).json({
            error: false,
            msg: "Status Updated"
        });
    }
    else {
        return res.status(300).json({
            error: false,
            msg: "wrong request"
        });
    }
};
exports.postNotificationStatus = postNotificationStatus;
const getNotificationStatus = async (req, res, next) => {
    const decode = res.locals.user;
    const _id = decode._id;
    if (_id) {
        //handle scheduled notification
        const user = await user_model_1.default.findById(_id);
        // @ts-ignore
        const status = user.push_notification_status;
        return res.status(200).json({
            error: false,
            msg: "Notification Scheduled",
            data: { status: status }
        });
    }
    else {
        return res.status(300).json({
            error: false,
            msg: "wrong request"
        });
    }
};
exports.getNotificationStatus = getNotificationStatus;
const SettingJon = async (req, res, next) => {
    try {
        await settings_model_1.default.findOneAndUpdate({}, req.body, { upsert: true });
        return res.status(200).json({
            error: false,
            msg: "Setting Saved",
        });
    }
    catch (e) {
        return res.status(400).json({
            error: true,
            msg: "Error on server",
        });
    }
};
exports.SettingJon = SettingJon;
//# sourceMappingURL=push_notification.controller.js.map