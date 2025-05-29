"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delLeaveSetting = exports.getLeaveSetting = exports.postLeaveSetting = void 0;
const leave_setting_model_1 = __importDefault(require("../models/leave_setting.model"));
// post LeaveSetting
const postLeaveSetting = async (req, res, next) => {
    try {
        const { body } = req;
        if (body._id) {
            await leave_setting_model_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            await leave_setting_model_1.default.create({
                title: body.title,
                days: body.days,
                type: body.type,
                icon: body.icon
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            });
        }
    }
    catch (error) {
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
exports.postLeaveSetting = postLeaveSetting;
// get LeaveSetting
const getLeaveSetting = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        if (query._id) {
            const leaveSetting = await leave_setting_model_1.default.findById(query._id);
            return res.status(200).json({
                error: false,
                data: leaveSetting
            });
        }
        else {
            if (query.search) {
                filter = {
                    $or: [
                        { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        { status: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    ]
                };
            }
            ;
            // @ts-ignore
            const leaveSetting = await leave_setting_model_1.default.aggregatePaginate(leave_setting_model_1.default.aggregate([
                { $match: filter },
                { $sort: { createdAt: -1 } }
            ]), {
                page: query.page || 1,
                limit: query.size || 10,
            });
            return res.status(200).json({
                error: false,
                data: leaveSetting
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
exports.getLeaveSetting = getLeaveSetting;
// delete LeaveSetting
const delLeaveSetting = async (req, res, next) => {
    try {
        const { query } = req;
        await leave_setting_model_1.default.findByIdAndDelete(query._id);
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
exports.delLeaveSetting = delLeaveSetting;
//# sourceMappingURL=leave_setting.controller.js.map