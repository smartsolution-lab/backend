import admin, {sendNotification} from "../utils/push_notification/push";
import User from "../models/user.model";
import {allUserFcmArray, driverFcmArray, userFcmArray} from '../utils/push_notification/aggretion'
import PushNotification from "../models/push_notificatio.model";
import Settings from "../models/settings.model";
import {mongo} from "mongoose";

export const getNotification = async (req, res, next) => {
    const {query} = req;

    if (query.status === 'all') {
        const data = await PushNotification.find().sort({createdAt: -1})
        return res.status(200).json({
            error: false,
            msg: "ok",
            data: data
        })
    }
    if (query.status === 'scheduled') {
        const data = await PushNotification.find({status: 'scheduled'}).sort({createdAt: -1})
        return res.status(200).json({
            error: false,
            msg: "ok",
            data: data
        })

    } else if (query.status === 'failed') {
        const data = await PushNotification.find({status: 'failed'}).sort({createdAt: -1})
        return res.status(200).json({
            error: false,
            msg: "ok",
            data: data
        })
    } else {
        return res.status(300).json({
            error: true,
            msg: "Error in request",
        })
    }
}


export const postNotification = async (req, res, next) => {

    if (req.body.scheduled_date) {
        //handle scheduled notification
        await PushNotification.create({
            title: req.body.title,
            body: req.body.body,
            to_users: req.body.to_users,
            status: 'scheduled',
            scheduled_date: req.body.scheduled_date,
        })
        return res.status(200).json({
            error: false,
            msg: "Notification Scheduled"
        })
    } else {
        if (req.body.to_users === 'all_user') {

            await PushNotification.create({
                title: req.body.title,
                body: req.body.body,
                to_users: 'all_user'
            })

            const data = await User.aggregate(allUserFcmArray)
            const fcm_tokens = data[0].fcm_tokens
            fcm_tokens.map(async (token) => {
                const response = await sendNotification(token, req.body.title, req.body.body)
                if (response) {
                } else {
                }
            })

            return res.status(200).json({
                error: false,
                msg: "Notification Send"
            })
        } else if (req.body.to_users === 'driver') {

            await PushNotification.create({
                title: req.body.title,
                body: req.body.body,
                to_users: 'driver'
            })

            const data = await User.aggregate(driverFcmArray)
            const fcm_tokens = data[0].fcm_tokens
            fcm_tokens.map(async (token) => {
                const response = await sendNotification(token, req.body.title, req.body.body)
                if (response) {
                } else {
                }
            })

            return res.status(200).json({
                error: false,
                msg: "Notification Send"
            })
        } else if (req.body.to_users === 'user') {

            await PushNotification.create({
                title: req.body.title,
                body: req.body.body,
                to_users: 'user'
            })

            const data = await User.aggregate(userFcmArray)
            const fcm_tokens = data[0].fcm_tokens
            fcm_tokens.map(async (token) => {
                const response = await sendNotification(token, req.body.title, req.body.body)
                if (response) {
                } else {
                }
            })

            return res.status(200).json({
                error: false,
                msg: "Notification Send"
            })
        } else if (!!req.body.to) {
            const {to} = req.body
            const group_id = new mongo.ObjectId(to)
            const data = await User.aggregate([
                {
                    $match: {
                        group_id: group_id
                    }
                },

            ])
            await PushNotification.create({
                title: req.body.title,
                body: req.body.body,
                group: group_id
            })
            return res.status(200).json({
                error: false,
                msg: "Notification Send"
            })
        } else {
            return res.status(300).json({
                error: false,
                msg: "wrong request"
            })
        }
    }
}
export const postNotificationStatus = async (req, res, next) => {
    const {body} = req
    const decode = res.locals.user
    const _id = decode._id
    if (_id) {
        //handle scheduled notification
        await User.findByIdAndUpdate(_id, {push_notification_status: body.status})
        return res.status(200).json({
            error: false,
            msg: "Status Updated"
        })
    } else {
        return res.status(300).json({
            error: false,
            msg: "wrong request"
        })

    }
}
export const getNotificationStatus = async (req, res, next) => {
    const decode = res.locals.user
    const _id = decode._id
    if (_id) {
        //handle scheduled notification
        const user = await User.findById(_id)
        // @ts-ignore
        const status = user.push_notification_status

        return res.status(200).json({
            error: false,
            msg: "Notification Scheduled",
            data: {status: status}
        })
    } else {
        return res.status(300).json({
            error: false,
            msg: "wrong request"
        })

    }
}


export const SettingJon = async (req, res, next) => {
    try {
        await Settings.findOneAndUpdate({}, req.body, {upsert: true})
        return res.status(200).json({
            error: false,
            msg: "Setting Saved",
        })
    } catch (e) {

        return res.status(400).json({
            error: true,
            msg: "Error on server",
        })
    }

}




