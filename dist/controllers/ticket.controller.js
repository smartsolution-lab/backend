"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTicketEmployeeList = exports.fetchTicketTypeList = exports.postTicketType = exports.ticketDepartmentList = exports.postTicketDepartment = exports.getTicketByUser = exports.getTicket = exports.postTicketNotes = exports.postTicketMessage = exports.postTicket = exports.delTicketSetting = exports.postTicketSetting = exports.getTicketType = exports.getTicketDepartment = exports.deleteTicketPriority = exports.postTicketPriority = exports.getTicketPriority = void 0;
const ticket_department_1 = __importDefault(require("../models/ticket_department"));
const ticket_type_1 = __importDefault(require("../models/ticket_type"));
const ticket_priority_1 = __importDefault(require("../models/ticket_priority"));
const ticket_model_1 = __importDefault(require("../models/ticket.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const settings_model_1 = __importDefault(require("../models/settings.model"));
function omit(key, obj) {
    const { [key]: omitted, ...rest } = obj;
    return rest;
}
const getTicketPriority = async (req, res) => {
    try {
        const data = await ticket_priority_1.default.find();
        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: data,
        });
    }
    catch (err) {
        return res.status(500).send({
            error: true,
            msg: "Server failed",
        });
    }
};
exports.getTicketPriority = getTicketPriority;
const postTicketPriority = async (req, res) => {
    const { body } = req;
    if (!!body._id) {
        try {
            await ticket_priority_1.default.findByIdAndUpdate({ _id: body._id }, body);
            return res.status(200).send({
                error: false,
                msg: "Update Sussessful",
            });
        }
        catch (err) {
            console.log(err.message);
            return res.status(500).send({
                error: true,
                msg: "Server failed",
            });
        }
    }
    else {
        try {
            await ticket_priority_1.default.create({ name: body.name, value: body.value });
            return res.status(200).send({
                error: false,
                msg: "Successfully Created",
            });
        }
        catch (err) {
            console.log(err.message);
            return res.status(500).send({
                error: true,
                msg: "Server failed",
            });
        }
    }
};
exports.postTicketPriority = postTicketPriority;
const deleteTicketPriority = async (req, res) => {
    const { query } = req;
    try {
        const c = await ticket_priority_1.default.deleteOne({ _id: query._id });
        if (c?.deletedCount > 0)
            return res.status(200).json({
                error: false,
                msg: "Delete was successful",
            });
    }
    catch (err) {
        return res.status(500).send({
            error: true,
            msg: "Server failed",
        });
    }
};
exports.deleteTicketPriority = deleteTicketPriority;
const getTicketDepartment = async (req, res) => {
    try {
        const data = await ticket_department_1.default.find();
        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: data,
        });
    }
    catch (err) {
        return res.status(500).send({
            error: true,
            msg: "Server failed",
        });
    }
};
exports.getTicketDepartment = getTicketDepartment;
const getTicketType = async (req, res) => {
    try {
        const data = await ticket_type_1.default.find();
        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: data,
        });
    }
    catch (err) {
        return res.status(500).send({
            error: true,
            msg: "Server failed",
        });
    }
};
exports.getTicketType = getTicketType;
//depertment category and types are update and deleted through postTicket Settiing and delTicketSettings
const postTicketSetting = async (req, res) => {
    const { body } = req;
    if (!!body._id) {
        if (!!body.department) {
            try {
                await ticket_type_1.default.findByIdAndUpdate({ _id: body._id }, body);
                return res.status(200).send({
                    error: false,
                    msg: "Update Sussessful",
                });
            }
            catch (err) {
                console.log(err.message);
                return res.status(500).send({
                    error: true,
                    msg: "Server failed",
                });
            }
        }
        else {
            try {
                await ticket_department_1.default.findByIdAndUpdate({ _id: body._id }, body);
                return res.status(200).send({
                    error: false,
                    msg: "Update Successful",
                });
            }
            catch (err) {
                console.log(err.message);
                return res.status(500).send({
                    error: true,
                    msg: "Server failed",
                });
            }
        }
    }
    else {
        if (!!body.department) {
            try {
                const find = await ticket_type_1.default.find({ name: body.name });
                console.log(find);
                if (find.length > 0) {
                    //update logic
                    return res.status(403).send({
                        error: true,
                        msg: "Already exist",
                    });
                }
                else {
                    await ticket_type_1.default.create({
                        name: body.name,
                        department: body.department,
                    });
                }
                return res.status(200).send({
                    error: false,
                    msg: "Successfully updated pagee",
                });
            }
            catch (err) {
                console.log(err.message);
                return res.status(500).send({
                    error: true,
                    msg: "Server failed",
                });
            }
        }
        else {
            try {
                const find = await ticket_department_1.default.find({ name: body.name });
                if (find.length > 0) {
                    return res.status(200).send({
                        error: false,
                        msg: "Already exist",
                    });
                }
                else {
                    await ticket_department_1.default.create({ name: body.name });
                    return res.status(403).send({
                        error: false,
                        msg: "Successfully updated pagee",
                    });
                }
            }
            catch (err) {
                console.log(err.message);
                return res.status(500).send({
                    error: true,
                    msg: "Server failed",
                });
            }
        }
    }
};
exports.postTicketSetting = postTicketSetting;
const delTicketSetting = async (req, res) => {
    const { query } = req;
    const a = await ticket_department_1.default.deleteOne({ _id: query._id });
    if (a?.deletedCount > 0)
        return res.status(200).json({
            error: false,
            msg: "Delete was successful",
        });
    const c = await ticket_type_1.default.deleteOne({ _id: query._id });
    if (c?.deletedCount > 0)
        return res.status(200).json({
            error: false,
            msg: "Delete was successful",
        });
    if (c?.deletedCount > 0 || a?.deletedCount > 0)
        return res.status(500).send({
            error: true,
            msg: "Server failed",
        });
};
exports.delTicketSetting = delTicketSetting;
const postTicket = async (req, res) => {
    const { body } = req;
    const _id = res.locals.user._id;
    try {
        //handle tickets notes based on notes flag
        if (body.flag === "notes") {
            const note = { title: body.title, description: body.description };
            const find = await ticket_model_1.default.updateOne({ _id: body._id }, { $push: { notes: note } });
            return res.status(200).send({
                error: false,
                msg: "TIcket Updated",
            });
        }
        //  tickets status
        else if (!!body.flag) {
            const status = body.flag;
            await ticket_model_1.default.updateOne({ _id: body._id }, { status: status });
            return res.status(200).send({
                error: false,
                msg: body.flag === "closed" ? "Ticket Closed" : "Ticket Opened",
            });
        }
        else {
            //create new ticket
            const ticket = await ticket_model_1.default.create({ ...body, created_by: _id });
            // console.log(ticket);
            const users = await user_model_1.default.aggregate([
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ["$role", "employee"] },
                                {
                                    $in: [
                                        ticket.department,
                                        "$ticket_departments",
                                    ],
                                },
                                { $gt: [{ $size: "$ticket_departments" }, 0] },
                            ],
                        },
                    },
                },
                {
                    $addFields: {
                        assigned_ticket_size: { $size: "$assigned_ticket" },
                    },
                },
                {
                    $sort: {
                        assigned_ticket_size: 1,
                    },
                },
                {
                    $limit: 1,
                },
                {
                    $project: {
                        _id: 1,
                    },
                },
            ]);
            if (users.length > 0) {
                var user = await user_model_1.default.findById(users[0]._id);
                // @ts-ignore
                user.assigned_ticket.push(ticket._id);
                // @ts-ignore
                ticket.assigned_to = user._id;
                await ticket.save();
                await user.save();
                return res.status(200).send({
                    error: false,
                    msg: "Successfully Created",
                });
            }
            else {
                //find user with least tickets assigned
                const users = await user_model_1.default.aggregate([
                    {
                        $match: {
                            ticket_departments: ticket.department,
                            assigned_ticket: {
                                $exists: true,
                            },
                        },
                    },
                    {
                        $sort: {
                            assigned_ticket: 1,
                        },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            _id: 1,
                        },
                    },
                ]);
                if (users.length > 0) {
                    var user = await user_model_1.default.findById(users[0]._id);
                    // @ts-ignore
                    user.assigned_ticket.push(ticket._id);
                    // @ts-ignore
                    ticket.assigned_to = user._id;
                    await ticket.save();
                    await user.save();
                    return res.status(200).send({
                        error: false,
                        msg: "Successfully Created",
                    });
                }
                else {
                    ticket.delete();
                    return res.status(400).send({
                        error: true,
                        msg: "Ticket cant be created because no employee to assign",
                    });
                }
            }
        }
    }
    catch (err) {
        return res.status(500).send({
            error: true,
            msg: "server error1",
        });
    }
};
exports.postTicket = postTicket;
const postTicketMessage = async (req, res) => {
    const { body } = req;
    let io = res.locals.socket;
    try {
        const ticket = await ticket_model_1.default.findById(body.ticket_id);
        const message = { message: body.message, user: body.user_id };
        ticket.messages.push(message);
        if (!ticket.answered) {
            ticket.answered = true;
            ticket.status = "open";
            await io.emit("ticket_notification", "Ticket " + ticket._id + " has been answered");
            try {
                await notification_model_1.default.create({
                    title: "Ticket Answered",
                    message: `Your ticket has been answered by ${body.user_id}`,
                    data: { ticket_id: ticket._id },
                    user_id: ticket.created_by,
                    type: "ticket",
                });
            }
            catch (e) {
                console.log(e);
            }
        }
        await ticket.save();
        await io.emit("ticket_msg", "msg saved");
        return res.status(200).send({
            error: false,
            msg: "Saved",
        });
    }
    catch (err) {
        return res.status(500).send({
            error: true,
            msg: "server error1",
        });
    }
};
exports.postTicketMessage = postTicketMessage;
const postTicketNotes = async (req, res) => {
    const { body } = req;
    try {
        const ticket = await ticket_model_1.default.findById(body.ticket_id);
        const note = {
            title: body.title,
            description: body.description,
            user: body.user_id,
        };
        ticket.notes.push(note);
        await ticket.save();
        return res.status(200).send({
            error: false,
            msg: "Saved",
        });
    }
    catch (err) {
        return res.status(500).send({
            error: true,
            msg: "server error1",
        });
    }
};
exports.postTicketNotes = postTicketNotes;
const getTicket = async (req, res) => {
    const query = req.query;
    if (!!query._id) {
        try {
            const tickets = await ticket_model_1.default.findOne({ _id: query._id });
            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: { docs: [tickets] },
            });
        }
        catch (e) {
            console.log(e);
            return res.status(400).send({
                error: true,
                msg: "Failed to fetch",
            });
        }
    }
    //for employee
    if (!!query.employee_id) {
        try {
            const tickets = await user_model_1.default.findById(query.employee_id).populate("assigned_ticket");
            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: tickets,
            });
        }
        catch (e) {
            console.log(e);
            return res.status(400).send({
                error: true,
                msg: "Failed to fetch",
            });
        }
    }
    //for filter operation
    let filter = {};
    switch (query.filter) {
        case "all":
            filter = {};
            break;
        case "department":
            filter = {
                department: new mongoose_1.default.Types.ObjectId(query.department),
            };
            break;
        case "category":
            filter = { category: new mongoose_1.default.Types.ObjectId(query.category) };
            break;
        case "priority":
            filter = {
                priorities: new mongoose_1.default.Types.ObjectId(query.priority),
            };
            break;
        case "status":
            filter = { status: query.status };
            break;
        case "assigned_to":
            filter = {
                assigned_to: new mongoose_1.default.Types.ObjectId(query.assigned_to),
            };
            break;
    }
    //for search operation
    let search_filter = {};
    if (query.search) {
        search_filter = {
            $or: [
                {
                    content: {
                        $regex: new RegExp(query.search.toLowerCase(), "i"),
                    },
                },
            ],
        };
    }
    try {
        // @ts-ignore
        let tickets = await ticket_model_1.default.aggregatePaginate(ticket_model_1.default.aggregate([
            {
                $match: filter,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "created_by",
                    foreignField: "_id",
                    as: "created_by",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "assigned_to",
                    foreignField: "_id",
                    as: "assigned_to",
                },
            },
            {
                $unwind: {
                    path: "$created_by",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$assigned_to",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unset: [
                    "created_by.password",
                    "assigned_to.password",
                    "created_by.__v",
                    "assigned_to.__v",
                    "created_by.verified",
                    "assigned_to.verified",
                    "created_by.active",
                    "assigned_to.active",
                    "created_by.key",
                    "assigned_to.key",
                    "created_by.ticket_departments",
                    "assigned_to.ticket_departments",
                    "created_by.ticket_categories",
                    "assigned_to.ticket_categories",
                    "created_by.ticket_types",
                    "assigned_to.ticket_types",
                    "created_by.assigned_ticket",
                    "assigned_to.assigned_ticket",
                    "created_by.createdAt",
                    "assigned_to.createdAt",
                    "created_by.updatedAt",
                    "assigned_to.updatedAt",
                    "created_by.fcm_token",
                    "assigned_to.fcm_token",
                    "created_by.driver_transport",
                    "assigned_to.driver_transport",
                    "created_by.vehicles",
                    "assigned_to.vehicles",
                ],
            },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            $match: search_filter,
            sort: { createdAt: -1 },
        });
        return res.status(200).send({
            error: false,
            msg: "Email Sent",
            data: tickets,
        });
    }
    catch (e) {
        console.log(e);
    }
};
exports.getTicket = getTicket;
const getTicketByUser = async (req, res) => {
    const _id = res.locals.user._id;
    const settings = await settings_model_1.default.findOne({});
    try {
        if (_id) {
            const tickets = await ticket_model_1.default.find({ created_by: _id })
                .populate("created_by")
                .populate("assigned_to")
                .populate("department")
                .populate("category")
                .populate("priorities");
            return res.status(200).send({
                error: false,
                socket_url: settings?.url?.socket_url,
                msg: "Fetch Successful",
                data: tickets,
            });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(400).send({
            error: true,
            msg: "Failed to fetch",
        });
    }
};
exports.getTicketByUser = getTicketByUser;
// if (!!) {
//     try {
//         const tickets = await User.findById(query.employee_id).populate('assigned_ticket')
//         return res.status(200).send({
//             error: false,
//             msg: "Fetch Successful",
//             data: tickets
//         })
//     } catch (e) {
//         console.log(e)
//         return res.status(400).send({
//             error: true,
//             msg: "Failed to fetch",
//         })
//     }
// }
/*
 *
 * By Md. Sabbir Ahmmed, From Here
 *
 * */
const postTicketDepartment = async (req, res) => {
    try {
        const { body } = req;
        if (body._id) {
            await ticket_department_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: "Successfully updated",
            });
        }
        else {
            delete body._id;
            const newTrip = await ticket_department_1.default.create({ ...body });
            return res.status(200).json({
                error: false,
                msg: "Created successfully",
                data: newTrip,
            });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(500).send({
            error: true,
            msg: "Server failed",
        });
    }
};
exports.postTicketDepartment = postTicketDepartment;
const ticketDepartmentList = async (req, res) => {
    try {
        const { query } = req;
        let filter = {
            parent: { $exists: !!query.category },
            active: query.active === "true" ? true : { $exists: true },
        };
        if (!!query.parent) {
            filter.parent = new mongoose_1.default.Types.ObjectId(query.parent);
        }
        if (query.search) {
            filter = {
                $or: [
                    {
                        name: {
                            $regex: new RegExp(query.search.toLowerCase(), "i"),
                        },
                    },
                    {
                        "parent.name": {
                            $regex: new RegExp(query.search.toLowerCase(), "i"),
                        },
                    },
                ],
            };
        }
        // @ts-ignore
        const ticket_departments = await ticket_department_1.default.aggregatePaginate(ticket_department_1.default.aggregate([
            ...(!!query._id
                ? [
                    {
                        $match: {
                            _id: new mongoose_1.default.Types.ObjectId(query._id),
                        },
                    },
                ]
                : []),
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: ticket_departments,
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: "Server failed",
        });
    }
};
exports.ticketDepartmentList = ticketDepartmentList;
const postTicketType = async (req, res) => {
    try {
        const { body } = req;
        if (body._id) {
            await ticket_type_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: "Successfully updated",
            });
        }
        else {
            delete body._id;
            const newType = await ticket_type_1.default.create({ ...body });
            return res.status(200).json({
                error: false,
                msg: "Created successfully",
                data: newType,
            });
        }
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: "Server failed",
        });
    }
};
exports.postTicketType = postTicketType;
const fetchTicketTypeList = async (req, res) => {
    try {
        const { query } = req;
        console.log(query);
        let filter = {};
        filter.active = query.active === "true" ? true : { $exists: true };
        if (!!query.search) {
            filter = {
                $or: [
                    {
                        name: {
                            $regex: new RegExp(query.search.toLowerCase(), "i"),
                        },
                    },
                ],
            };
        }
        // @ts-ignore
        const ticket_types = await ticket_type_1.default.aggregatePaginate(ticket_type_1.default.aggregate([
            ...(!!query._id
                ? [
                    {
                        $match: {
                            _id: new mongoose_1.default.Types.ObjectId(query._id),
                        },
                    },
                ]
                : []),
            ...(!!query.department
                ? [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    new mongoose_1.default.Types.ObjectId(query.department),
                                    "$departments",
                                ],
                            },
                        },
                    },
                ]
                : []),
            ...(!!query.category
                ? [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    new mongoose_1.default.Types.ObjectId(query.category),
                                    "$categories",
                                ],
                            },
                        },
                    },
                ]
                : []),
            {
                $lookup: {
                    from: "ticket_departments",
                    let: { ids: "$departments" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$ids"] },
                            },
                        },
                        {
                            $project: {
                                name: 1,
                            },
                        },
                    ],
                    as: "departments",
                },
            },
            {
                $lookup: {
                    from: "ticket_departments",
                    let: { ids: "$categories" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$ids"] },
                            },
                        },
                        {
                            $project: {
                                name: 1,
                            },
                        },
                    ],
                    as: "categories",
                },
            },
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: ticket_types,
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: "Server failed",
        });
    }
};
exports.fetchTicketTypeList = fetchTicketTypeList;
const fetchTicketEmployeeList = async (req, res) => {
    try {
        const { query } = req;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    {
                        name: {
                            $regex: new RegExp(query.search.toLowerCase(), "i"),
                        },
                    },
                    {
                        email: {
                            $regex: new RegExp(query.search.toLowerCase(), "i"),
                        },
                    },
                    {
                        phone: {
                            $regex: new RegExp(query.search.toLowerCase(), "i"),
                        },
                    },
                    {
                        key: {
                            $regex: new RegExp(query.search.toLowerCase(), "i"),
                        },
                    },
                    {
                        "department.name": {
                            $regex: new RegExp(query.search.toLowerCase(), "i"),
                        },
                    },
                    {
                        "ticket_departments.name": {
                            $regex: new RegExp(query.search.toLowerCase(), "i"),
                        },
                    },
                    {
                        "ticket_categories.name": {
                            $regex: new RegExp(query.search.toLowerCase(), "i"),
                        },
                    },
                ],
            };
        }
        // @ts-ignore
        const ticket_employee = await user_model_1.default.aggregatePaginate(user_model_1.default.aggregate([
            {
                $match: { ticket_departments: { $exists: true } },
            },
            {
                $match: {
                    $expr: {
                        $gt: [{ $size: "$ticket_departments" }, 0],
                    },
                },
            },
            {
                $lookup: {
                    from: "ticket_departments",
                    let: { ids: "$ticket_departments" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$ids"] },
                            },
                        },
                        {
                            $project: {
                                name: 1,
                            },
                        },
                    ],
                    as: "ticket_departments",
                },
            },
            {
                $lookup: {
                    from: "ticket_departments",
                    let: { ids: "$ticket_categories" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$ids"] },
                            },
                        },
                        {
                            $project: {
                                name: 1,
                            },
                        },
                    ],
                    as: "ticket_categories",
                },
            },
            {
                $lookup: {
                    from: "ticket_types",
                    let: { ids: "$ticket_types" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$ids"] },
                            },
                        },
                        {
                            $project: {
                                name: 1,
                            },
                        },
                    ],
                    as: "ticket_types",
                },
            },
            {
                $project: {
                    password: 0,
                },
            },
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: ticket_employee,
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: "Server failed",
        });
    }
};
exports.fetchTicketEmployeeList = fetchTicketEmployeeList;
//# sourceMappingURL=ticket.controller.js.map