"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delWhatsappMessage = exports.postWhatsappMessage = exports.getAllWhatsappMessage = exports.delDeliverySMS = exports.postDeliverySMS = exports.getAllSMS = exports.delDeliveryEmail = exports.postDeliveryEmail = exports.getAllMail = exports.updateSettings = exports.getSettings = exports.postUsers = exports.getAvailableUsers = exports.postAllUsers = exports.getAllUsers = exports.postSubscribeUsers = exports.getSubscribedUsers = exports.delMarketingGroups = exports.postMarketingGroups = exports.getMarketingGroups = void 0;
const marketing_group_model_1 = __importDefault(require("../models/marketing_group.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const marketing_setting_model_1 = __importDefault(require("../models/marketing_setting.model"));
const deliveryMail_1 = require("../utils/marketing/deliveryMail");
const marketing_mails_model_1 = __importDefault(require("../models/marketing_mails.model"));
const marketing_users_model_1 = __importDefault(require("../models/marketing_users.model"));
const marketing_sms_model_1 = __importDefault(require("../models/marketing_sms.model"));
const deliverySMS_1 = require("../utils/marketing/deliverySMS");
const marketing_whatsapp_model_1 = __importDefault(require("../models/marketing_whatsapp.model"));
const deliveryWhatsapp_1 = require("../utils/marketing/deliveryWhatsapp");
const mongoose_1 = __importDefault(require("mongoose"));
function omit(key, obj) {
    const { [key]: omitted, ...rest } = obj;
    return rest;
}
// group CRUD functions
const getMarketingGroups = async (req, res) => {
    const { query } = req;
    if (query._id) {
        try {
            // @ts-ignore
            const _id = new mongoose_1.default.Types.ObjectId(query._id);
            // @ts-ignore
            const data = await marketing_group_model_1.default.aggregatePaginate(marketing_group_model_1.default.aggregate([
                {
                    $match: { _id: _id }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "groups",
                        foreignField: "_id",
                        as: "groups"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        groups: {
                            _id: 1,
                            name: 1,
                            phone: 1,
                            email: 1,
                        }
                    }
                },
            ]), {
                page: query.page || 1,
                limit: query.size || 20,
            });
            const payload = { _id: mongoose_1.default.Types.ObjectId, name: '', docs: [] };
            // @ts-ignore
            payload._id = _id;
            payload.name = data.docs[0]?.name || '';
            payload.docs = data.docs[0]?.groups || '';
            //search filters
            const filters = {};
            if (query.search) {
                filters['name'] = new RegExp(query.search, 'i');
                filters['email'] = new RegExp(query.search, 'i');
                filters['phone'] = new RegExp(query.search, 'i');
            }
            payload.docs = payload.docs.filter((item) => {
                return item.name.match(filters['name']) || item.email.match(filters['email']) || item.phone.match(filters['phone']);
            });
            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: payload
            });
        }
        catch (err) {
            console.log('This error occurred in getMarketingGroups function');
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            });
        }
    }
    else {
        try {
            let data = [];
            if (req.query.type === "email") {
                if (req.query.status === 'true') {
                    data = await marketing_group_model_1.default.find({ type: "email", status: true });
                }
                else {
                    data = await marketing_group_model_1.default.find({ type: "email" });
                }
            }
            else if (req.query.type === "sms") {
                if (req.query.status === 'true') {
                    data = await marketing_group_model_1.default.find({ type: "sms", status: true });
                }
                else {
                    data = await marketing_group_model_1.default.find({ type: "sms" });
                }
            }
            else if (req.query.type === "whatsapp_sms") {
                if (req.query.status === 'true') {
                    data = await marketing_group_model_1.default.find({ type: "whatsapp_sms", status: true });
                }
                else {
                    data = await marketing_group_model_1.default.find({ type: "whatsapp_sms" });
                }
            }
            else if (req.query.type === "notification") {
                if (req.query.status === 'true') {
                    data = await marketing_group_model_1.default.find({ type: "notification", status: true });
                }
                else {
                    data = await marketing_group_model_1.default.find({ type: "notification" });
                }
            }
            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: data
            });
        }
        catch (err) {
            console.log('This error occurred in getMarketingGroups function');
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            });
        }
    }
};
exports.getMarketingGroups = getMarketingGroups;
const postMarketingGroups = async (req, res) => {
    const { body } = req;
    if (body._id !== '') {
        try {
            await marketing_group_model_1.default.findByIdAndUpdate(body._id, body, { new: true });
            return res.status(200).send({
                error: false,
                msg: "Update Successful",
            });
        }
        catch (err) {
            console.log(err.message);
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            });
        }
    }
    else {
        try {
            await marketing_group_model_1.default.create({ name: body.name, groups: [], active: true, type: body.type });
            return res.status(200).send({
                error: false,
                msg: "Successfully Created Group",
            });
        }
        catch (err) {
            console.log(err.message);
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            });
        }
    }
};
exports.postMarketingGroups = postMarketingGroups;
const delMarketingGroups = async (req, res) => {
    try {
        await marketing_group_model_1.default.findByIdAndDelete(req.query._id);
        return res.status(200).send({
            error: false,
            msg: "Delete Successful",
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).send({
            error: true,
            msg: "Server failed"
        });
    }
};
exports.delMarketingGroups = delMarketingGroups;
//Marketing Users Routes
const getSubscribedUsers = async (req, res) => {
    const { query } = req;
    const page = query.page ? query.page : 1;
    const size = Number(query.size ? query.size : (2 ** 53 - 1)); //max size for each page, (2 ** 53 - 1) means get all users
    const skip = Number((page - 1) * size);
    //define match stage
    const matchStage = { email: { $ne: null } };
    //define search stage
    const searchStage = query.search ? {
        $or: [
            { name: { $regex: query.search, $options: 'i' } },
            { email: { $regex: query.search, $options: 'i' } }
        ]
    } : {};
    try {
        let users = await marketing_users_model_1.default.aggregate([
            {
                $match: searchStage
            },
            {
                $facet: {
                    docs: [
                        {
                            //only include these fields
                            $project: {
                                name: 1,
                                email: 1,
                                marketing_status: 1,
                                createdAt: 1,
                            }
                        },
                        { $skip: skip },
                        { $limit: size }
                    ],
                    totalDocs: [{
                            $count: 'createdAt'
                        }],
                }
            },
            {
                $project: {
                    docs: 1,
                    totalPages: {
                        $ceil: {
                            $divide: [
                                { $first: '$totalDocs.createdAt' },
                                size
                            ]
                        }
                    },
                }
            }
        ]);
        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: users[0]
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).send({
            error: true,
            msg: "Server Error ",
        });
    }
};
exports.getSubscribedUsers = getSubscribedUsers;
const postSubscribeUsers = async (req, res) => {
    if (req.body._id) {
        await marketing_users_model_1.default.findByIdAndUpdate(req.body._id, { marketing_status: req.body.marketing_status });
        return res.status(200).send({
            error: false,
            msg: "User Updated",
        });
    }
    else {
        const email = req.body.email;
        const name = req.body.name ? req.body.name : '';
        if (email) {
            try {
                await marketing_users_model_1.default.create({ email, name });
                return res.status(200).send({
                    error: false,
                    msg: "You have successfully subscribed to our newsletter",
                });
            }
            catch (err) {
                return res.status(500).send({
                    error: true,
                    msg: "Already subscribed",
                });
            }
        }
        else {
            return res.status(400).send({
                error: true,
                msg: "Cant receive your email.Try again later",
            });
        }
    }
};
exports.postSubscribeUsers = postSubscribeUsers;
const getAllUsers = async (req, res) => {
    const { query } = req;
    const page = query.page ? query.page : 1;
    const size = Number(query.size ? query.size : (2 ** 53 - 1)); //max size for each page, (2 ** 53 - 1) means get all users
    const skip = Number((page - 1) * size);
    //define match stage
    const matchStage = query.marketing_status ? {
        role: { $in: ['user', 'driver', 'employee'] },
        marketing_status: query.marketing_status
    } : {
        role: { $in: ['user', 'driver', 'employee'] }
    };
    //define search stage
    const searchStage = query.search ? {
        $or: [
            { name: { $regex: new RegExp(query.search.toLowerCase(), 'i') } },
            { email: { $regex: new RegExp(query.search.toLowerCase(), 'i') } },
            { phone: { $regex: new RegExp(query.search.toLowerCase(), 'i') } },
        ]
    } : {};
    try {
        let users = await user_model_1.default.aggregate([
            {
                $match: matchStage
            },
            {
                $match: searchStage
            },
            {
                $facet: {
                    docs: [
                        {
                            //only include these fields
                            $project: {
                                name: 1,
                                phone: 1,
                                email: 1,
                                marketing_status: 1,
                                createdAt: 1,
                            }
                        },
                        { $skip: skip },
                        { $limit: size }
                    ],
                    totalDocs: [{
                            $count: 'createdAt'
                        }],
                }
            },
            {
                $project: {
                    docs: 1,
                    totalPages: {
                        $ceil: {
                            $divide: [
                                { $first: '$totalDocs.createdAt' },
                                size
                            ]
                        }
                    },
                }
            }
        ]);
        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: users[0]
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).send({
            error: true,
            msg: "Server Error ",
        });
    }
};
exports.getAllUsers = getAllUsers;
const postAllUsers = async (req, res) => {
    const _id = req.body._id;
    if (_id) {
        try {
            let users = await user_model_1.default.findByIdAndUpdate(_id, { marketing_status: req.body.marketing_status });
            return res.status(200).send({
                error: false,
                msg: "User Updated",
                data: users
            });
        }
        catch (err) {
            return res.status(500).send({
                error: true,
                msg: "Server Error ",
            });
        }
    }
    else {
        return res.status(500).send({
            error: true,
            msg: "Server Error ",
        });
    }
};
exports.postAllUsers = postAllUsers;
const getAvailableUsers = async (req, res) => {
    const { query } = req;
    if (req.query._id) {
        const data = await marketing_group_model_1.default.findById(req.query._id, 'groups');
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { phone: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { email: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const users = await user_model_1.default.aggregatePaginate(user_model_1.default.aggregate([
            { $match: { _id: { $nin: data?.groups } } },
            { $project: { name: 1, phone: 1, email: 1 } },
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
        });
        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: users
        });
    }
    else {
        return res.status(403).send({
            error: true,
            msg: "Invalid Request"
        });
    }
};
exports.getAvailableUsers = getAvailableUsers;
const postUsers = async (req, res) => {
    if (req.body._id) {
        //first check delete
        if (req.body.delete) {
            await marketing_group_model_1.default.updateOne({ _id: req.body._id }, { $pull: { groups: req.body.userId } });
            return res.status(200).send({
                error: false,
                msg: "User Deleted",
            });
        }
        const find = await marketing_group_model_1.default.findById(req.body._id, 'groups');
        if (Array.isArray(req.body.userId)) {
            req.body.userId.map((userId) => {
                find.groups.push(userId);
            });
            await find.save();
        }
        else {
            find.groups.push(req.body.userId);
            await find.save();
        }
        return res.status(200).send({
            error: false,
            msg: "User Added TO Group",
        });
    }
    else {
        return res.status(403).send({
            error: true,
            msg: "Invalid Request"
        });
    }
};
exports.postUsers = postUsers;
// emails configuration & send apis
const getSettings = async (req, res) => {
    try {
        let settings = await marketing_setting_model_1.default.findOne();
        return res.status(200).send({
            error: false,
            msg: 'Successfully gets settings',
            data: settings
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        let { body } = req;
        if (!!req.body.email) {
            const key = Object.keys(body.email)[0];
            if (req.body.email.default === true) {
                await marketing_setting_model_1.default.findOneAndUpdate({}, { $set: { "email.default": key } }, { upsert: true, new: true });
            }
            switch (key) {
                case 'sendgrid':
                    await marketing_setting_model_1.default.findOneAndUpdate({}, { $set: { "email.sendgrid": body.email.sendgrid } }, { upsert: true, new: true });
                    return res.status(200).send({
                        error: false,
                        msg: 'Successfully updated settings'
                    });
                case 'gmail':
                    await marketing_setting_model_1.default.findOneAndUpdate({}, { $set: { "email.gmail": body.email.gmail } }, { upsert: true, new: true });
                    return res.status(200).send({
                        error: false,
                        msg: 'Successfully updated settings'
                    });
                case 'other':
                    await marketing_setting_model_1.default.findOneAndUpdate({}, { $set: { "email.other": body.email.other } }, { upsert: true, new: true });
                    return res.status(200).send({
                        error: false,
                        msg: 'Successfully updated settings'
                    });
            }
        }
        else {
            await marketing_setting_model_1.default.findOneAndUpdate({}, body, { upsert: true });
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated settings'
            });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.updateSettings = updateSettings;
//email routes
const getAllMail = async (req, res) => {
    const query = req.query;
    let filter = {};
    try {
        if (query.search) {
            filter = {
                $or: [
                    { "content": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "subject": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        let allEmails = await marketing_mails_model_1.default.aggregatePaginate(marketing_mails_model_1.default.aggregate([{ $match: { status: query.status || { $exists: true } } },
            { $match: filter }, {
                $lookup: {
                    from: "marketing_groups", localField: "group", foreignField: "_id", as: "group"
                }
            }, {
                $unwind: {
                    path: "$group",
                    preserveNullAndEmptyArrays: true
                }
            }, { $unset: ["group.createdAt", "group.updatedAt", "group.type", "group.status", "group.groups", "group.__v"] },]), {
            page: query.page || 1,
            limit: query.size || 10,
            $match: filter,
            sort: { createdAt: -1 },
        });
        return res.status(200).send({
            error: false,
            msg: "Email Sent",
            data: allEmails
        });
    }
    catch (e) {
        console.log(e);
    }
};
exports.getAllMail = getAllMail;
const postDeliveryEmail = async (req, res) => {
    //first collect all emails to send into array
    let to = [];
    //find emails for group
    if (req.body.to) {
        const group = await marketing_group_model_1.default.findById(req.body.to).populate('groups', 'email');
        //for group mail
        // @ts-ignore
        to = group.groups.map(x => x.email);
    }
    //for all subscribers
    if (req.body.subscriber) {
        const subscribers = await marketing_users_model_1.default.find().select('email');
        subscribers.forEach((subscriber) => to.push(subscriber.email));
    }
    //find all users where role is driver and push their email to array
    if (req.body.driver) {
        const drivers = await user_model_1.default.find({ role: 'driver' }).select('email');
        drivers.forEach((driver) => to.push(driver.email));
    }
    //find all users where role is user and push their email to array
    if (req.body.user) {
        const users = await user_model_1.default.find({ role: 'user' }).select('email');
        users.forEach((user) => to.push(user.email));
    }
    //find all users where role is employee and push their email to array
    if (req.body.employee) {
        const employees = await user_model_1.default.find({ role: 'employee' }).select('email');
        employees.forEach((employee) => to.push(employee.email));
    }
    //for individual mail
    if (req.body.individual_mail)
        to.push(req.body.individual_mail);
    //if scheduled date is set
    if (req.body.scheduled_date) {
        await marketing_mails_model_1.default.create({
            individual_mail: req.body.individual_mail,
            group: req.body.to,
            subscriber: req.body.subscriber,
            driver: req.body.driver,
            user: req.body.user,
            employee: req.body.employee,
            subject: req.body.subject,
            content: req.body.content,
            status: 'scheduled',
            scheduled_date: req.body.scheduled_date,
            to: to
        });
        return res.status(200).send({
            error: false,
            msg: "Email is scheduled",
        });
    }
    else {
        let mail = await marketing_mails_model_1.default.create({
            individual_mail: req.body.individual_mail,
            group: req.body.to,
            subject: req.body.subject,
            content: req.body.content,
            subscriber: req.body.subscriber,
            driver: req.body.driver,
            user: req.body.user,
            employee: req.body.employee,
            status: 'pending',
            to: to
        });
        //send mail
        (0, deliveryMail_1.sendMarketingEmail)({
            to: to,
            subject: req.body.subject,
            content: req.body.content,
        }).then((data) => {
            if (!!data) {
                mail.status = 'success';
                mail.from = data.from;
                mail.save();
            }
            else {
                mail.status = 'failed';
                mail.save();
            }
        });
        return res.status(200).send({
            error: false,
            msg: "Email Sent",
        });
    }
};
exports.postDeliveryEmail = postDeliveryEmail;
const delDeliveryEmail = async (req, res) => {
    try {
        await marketing_mails_model_1.default.findByIdAndDelete(req.query._id);
        return res.status(200).send({
            error: false,
            msg: 'Successfully deleted'
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.delDeliveryEmail = delDeliveryEmail;
//sms routes
const getAllSMS = async (req, res) => {
    const query = req.query;
    let filter = {};
    try {
        if (query.search) {
            filter = {
                $or: [
                    { "content": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        let allEmails = await marketing_sms_model_1.default.aggregatePaginate(marketing_sms_model_1.default.aggregate([{ $match: { status: query.status || { $exists: true } } },
            { $match: filter }, {
                $lookup: {
                    from: "marketing_groups", localField: "group", foreignField: "_id", as: "group"
                }
            }, {
                $unwind: {
                    path: "$group",
                    preserveNullAndEmptyArrays: true
                }
            }, { $unset: ["group.createdAt", "group.updatedAt", "group.type", "group.status", "group.groups", "group.__v"] },]), {
            page: query.page || 1,
            limit: query.size || 10,
            $match: filter,
            sort: { createdAt: -1 },
        });
        return res.status(200).send({
            error: false,
            msg: "Email Sent",
            data: allEmails
        });
    }
    catch (e) {
        console.log(e);
    }
};
exports.getAllSMS = getAllSMS;
const postDeliverySMS = async (req, res) => {
    //collect all numbers to send sms into array
    let to = [];
    //find group and push all numbers to array
    if (req.body.to) {
        const group = await marketing_group_model_1.default.findById(req.body.to).populate('groups', 'phone');
        //for group sms
        // @ts-ignore
        to = group.groups.map(x => x.phone);
    }
    //find all users where role is driver and push their phone to array
    if (req.body.driver) {
        const drivers = await user_model_1.default.find({ role: 'driver' }).select('phone');
        drivers.forEach((driver) => to.push(driver.phone));
    }
    //find all users where role is employee and push their phone to array
    if (req.body.employee) {
        const employees = await user_model_1.default.find({ role: 'employee' }).select('phone');
        employees.forEach((employee) => to.push(employee.phone));
    }
    //find all users where role is user and push their phone to array
    if (req.body.user) {
        const users = await user_model_1.default.find({ role: 'user' }).select('phone');
        users.forEach((user) => to.push(user.phone));
    }
    //for individual sms
    if (req.body.individual_number)
        to.push(req.body.individual_number);
    if (req.body.scheduled_date) {
        await marketing_sms_model_1.default.create({
            individual_number: req.body.individual_number,
            group: req.body.to,
            content: req.body.content,
            status: 'scheduled',
            driver: req.body.driver,
            user: req.body.user,
            employee: req.body.employee,
            scheduled_date: req.body.scheduled_date,
            to: to
        });
        return res.status(200).send({
            error: false,
            msg: "SMS is scheduled",
        });
    }
    else {
        let sms = await marketing_sms_model_1.default.create({
            individual_number: req.body.individual_number,
            group: req.body.to,
            content: req.body.content,
            driver: req.body.driver,
            user: req.body.user,
            employee: req.body.employee,
            scheduled_date: req.body.scheduled_date,
            to: to,
        });
        //send sms
        (0, deliverySMS_1.sendTwilioMarketingSms)(to, req.body.content).then((data) => {
            // @ts-ignore
            if (!!data) {
                sms.status = 'success';
                sms.save();
            }
            else {
                sms.status = 'failed';
                sms.save();
            }
        });
        return res.status(200).send({
            error: false,
            msg: "SMS Sent",
        });
    }
};
exports.postDeliverySMS = postDeliverySMS;
const delDeliverySMS = async (req, res) => {
    try {
        await marketing_sms_model_1.default.findByIdAndDelete(req.query._id);
        return res.status(200).send({
            error: false,
            msg: 'Successfully deleted'
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.delDeliverySMS = delDeliverySMS;
//whatsapp routes
const getAllWhatsappMessage = async (req, res) => {
    const query = req.query;
    let filter = {};
    try {
        if (query.search) {
            filter = {
                $or: [
                    { "content": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        let allEmails = await marketing_whatsapp_model_1.default.aggregatePaginate(marketing_whatsapp_model_1.default.aggregate([{ $match: { status: query.status || { $exists: true } } },
            { $match: filter }, {
                $lookup: {
                    from: "marketing_groups", localField: "group", foreignField: "_id", as: "group"
                }
            }, {
                $unwind: {
                    path: "$group",
                    preserveNullAndEmptyArrays: true
                }
            }, { $unset: ["group.createdAt", "group.updatedAt", "group.type", "group.status", "group.groups", "group.__v"] },]), {
            page: query.page || 1,
            limit: query.size || 10,
            $match: filter,
            sort: { createdAt: -1 },
        });
        return res.status(200).send({
            error: false,
            msg: "Email Sent",
            data: allEmails
        });
    }
    catch (e) {
        console.log(e);
    }
};
exports.getAllWhatsappMessage = getAllWhatsappMessage;
const postWhatsappMessage = async (req, res) => {
    //collect all phone numbers
    let to = [];
    if (req.body.to) {
        const group = await marketing_group_model_1.default.findById(req.body.to).populate('groups', 'phone');
        //for group sms
        // @ts-ignore
        to = group.groups.map(x => x.phone);
    }
    //find all users where role is driver and push their phone to array
    if (req.body.driver) {
        const drivers = await user_model_1.default.find({ role: 'driver' }).select('phone');
        drivers.forEach((driver) => to.push(driver.phone));
    }
    //find all users where role is employee and push their phone to array
    if (req.body.employee) {
        const employees = await user_model_1.default.find({ role: 'employee' }).select('phone');
        employees.forEach((employee) => to.push(employee.phone));
    }
    //find all users where role is user and push their phone to array
    if (req.body.user) {
        const users = await user_model_1.default.find({ role: 'user' }).select('phone');
        users.forEach((user) => to.push(user.phone));
    }
    //for individual sms
    if (req.body.individual_number)
        to.push(req.body.individual_number);
    if (req.body.scheduled_date) {
        await marketing_whatsapp_model_1.default.create({
            individual_number: req.body.individual_number,
            group: req.body.to,
            content: req.body.content,
            status: 'scheduled',
            driver: req.body.driver,
            user: req.body.user,
            employee: req.body.employee,
            scheduled_date: req.body.scheduled_date,
            to: to
        });
        return res.status(200).send({
            error: false,
            msg: "SMS is scheduled",
        });
    }
    else {
        let sms = await marketing_whatsapp_model_1.default.create({
            individual_number: req.body.individual_number,
            group: req.body.to,
            content: req.body.content,
            driver: req.body.driver,
            user: req.body.user,
            employee: req.body.employee,
            scheduled_date: req.body.scheduled_date,
            to: to,
        });
        //send whatsapp message
        (0, deliveryWhatsapp_1.sendWhatsappSms)(to, req.body.content).then((data) => {
            // @ts-ignore
            if (!!data) {
                sms.status = 'success';
                sms.save();
            }
            else {
                sms.status = 'failed';
                sms.save();
            }
        });
        return res.status(200).send({
            error: false,
            msg: "Message Sent",
        });
    }
};
exports.postWhatsappMessage = postWhatsappMessage;
const delWhatsappMessage = async (req, res) => {
    try {
        await marketing_whatsapp_model_1.default.findByIdAndDelete(req.query._id);
        return res.status(200).send({
            error: false,
            msg: 'Successfully deleted'
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.delWhatsappMessage = delWhatsappMessage;
//# sourceMappingURL=marketing.controller.js.map