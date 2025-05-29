"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delLeave = exports.getLeave = exports.postLeave = void 0;
const leave_model_1 = __importDefault(require("../models/leave.model"));
// post Leave
const postLeave = async (req, res, next) => {
    try {
        const { body } = req;
        if (body._id) {
            await leave_model_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            await leave_model_1.default.create({
                employee: body.employee,
                leave: body.leave,
                start_date: body.start_date,
                end_date: body.end_date,
                leave_days: body.leave_days,
                leave_reason: body.leave_reason,
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            });
        }
    }
    catch (error) {
        console.log("🚀 ~ file: leave.controller.ts:28 ~ postLeave ~ error", error);
        if (error?.code === 11000) {
            return res.status(400).json({
                error: true,
                msg: 'Duplicate warning!'
            });
        }
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.postLeave = postLeave;
// get Leave
const getLeave = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        if (query._id) {
            const leave = await leave_model_1.default.findById(query._id);
            return res.status(200).json({
                error: false,
                data: leave
            });
        }
        else {
            if (query.search) {
                filter = {
                    $or: [
                        { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        { leave: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        { type: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        { status: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        { days: Number(query.search) },
                        { leave_reason: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    ]
                };
            }
            ;
            // @ts-ignore
            const leave = await leave_model_1.default.aggregatePaginate(leave_model_1.default.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'employee',
                        foreignField: '_id',
                        as: 'employee'
                    }
                },
                { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'leave_settings',
                        localField: 'leave',
                        foreignField: '_id',
                        as: 'leave'
                    }
                },
                { $unwind: { path: "$leave", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        // name: { $concat: [{ $ifNull: [{ $concat: ["$employee.first_name", " "] }, ''] }, { $ifNull: [{ $concat: ["$employee.middle_name", " "] }, ''] }, { $ifNull: ["$employee.last_name", ''] }] },
                        leave: "$leave.title",
                        name: "$employee.name",
                        type: "$leave.type",
                        days: "$leave_days",
                        from: "$start_date",
                        to: "$end_date",
                        leave_reason: { $ifNull: ["$leave_reason", " "] },
                        status: 1,
                        createdAt: 1,
                    }
                },
                { $match: filter },
                { $sort: { createdAt: -1 } }
            ]), {
                page: query.page || 1,
                limit: query.size || 10,
            });
            return res.status(200).json({
                error: false,
                data: leave
            });
        }
        ;
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.getLeave = getLeave;
// delete Leave
const delLeave = async (req, res, next) => {
    try {
        const { query } = req;
        await leave_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.delLeave = delLeave;
//# sourceMappingURL=leave.controller.js.map