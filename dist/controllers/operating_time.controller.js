"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delOperatingTime = exports.getOperatingTimes = exports.postOperatingTime = void 0;
const operating_time_model_1 = __importDefault(require("../models/operating_time.model"));
// post OperatingTime
const postOperatingTime = async (req, res, next) => {
    try {
        const { body } = req;
        if (body._id) {
            await operating_time_model_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            await operating_time_model_1.default.create({
                day: body.day,
                opening_time: body.opening_time,
                closing_time: body.closing_time,
                status: body.status,
                manager: body.manager,
                restaurant: body.restaurant,
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            });
        }
    }
    catch (error) {
        console.log("🚀 ~ file: operating_time.controller.ts:32 ~ postOperatingTime ~ error", error);
        if (error?.code === 11000) {
            return res.status(400).json({
                error: true,
                msg: 'Duplicate warning!'
            });
        }
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postOperatingTime = postOperatingTime;
// get OperatingTime
const getOperatingTimes = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        // @ts-ignore
        const operatingTime = await operating_time_model_1.default.aggregate([
            // {
            //     $match: {
            //         restaurant: new mongoose.Types.ObjectId(query.restaurant)
            //     }
            // },
            { $match: filter },
        ]);
        return res.status(200).json({
            error: false,
            data: operatingTime
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getOperatingTimes = getOperatingTimes;
// delete OperatingTime
const delOperatingTime = async (req, res, next) => {
    try {
        const { query } = req;
        await operating_time_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.delOperatingTime = delOperatingTime;
//# sourceMappingURL=operating_time.controller.js.map