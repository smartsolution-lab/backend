"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delHoliday = exports.getHoliday = exports.postHoliday = void 0;
const holiday_model_1 = __importDefault(require("../models/holiday.model"));
// post Holiday
const postHoliday = async (req, res, next) => {
    try {
        const { body } = req;
        if (body._id) {
            await holiday_model_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            await holiday_model_1.default.create({
                title: body.title,
                start_date: body.start_date,
                end_date: body.end_date,
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
exports.postHoliday = postHoliday;
// get Holiday
const getHoliday = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        if (query._id) {
            const holiday = await holiday_model_1.default.findById(query._id);
            return res.status(200).json({
                error: false,
                data: holiday
            });
        }
        else {
            if (query.search) {
                filter = {
                    $or: [
                        { title: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    ]
                };
            }
            ;
            // @ts-ignore
            const holiday = await holiday_model_1.default.aggregatePaginate(holiday_model_1.default.aggregate([
                { $match: filter },
                { $sort: { createdAt: -1 } }
            ]), {
                page: query.page || 1,
                limit: query.size || 10,
            });
            return res.status(200).json({
                error: false,
                data: holiday
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
exports.getHoliday = getHoliday;
// delete Holiday
const delHoliday = async (req, res, next) => {
    try {
        const { query } = req;
        await holiday_model_1.default.findByIdAndDelete(query._id);
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
exports.delHoliday = delHoliday;
//# sourceMappingURL=holiday.controller.js.map