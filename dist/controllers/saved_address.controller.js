"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delSavedAddress = exports.getSavedAddress = exports.postSavedAddress = void 0;
const saved_address_model_1 = __importDefault(require("../models/saved_address.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const trip_request_model_1 = __importDefault(require("../models/trip_request.model"));
const postSavedAddress = async (req, res) => {
    try {
        const { body } = req;
        const { user } = res.locals;
        if (!!body?._id) {
            await saved_address_model_1.default.findByIdAndUpdate(body?._id, { $set: { ...body } });
            return res.status(200).json({
                error: false,
                msg: 'Address updated successfully',
            });
        }
        else {
            delete body?._id;
            await saved_address_model_1.default.create({ ...body, user: user?._id });
            return res.status(200).json({
                error: false,
                msg: 'Address saved successfully',
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.postSavedAddress = postSavedAddress;
const getSavedAddress = async (req, res) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        const addresses = await saved_address_model_1.default.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            {
                $match: { user: user?._id }
            },
        ]);
        const latestTrip = await trip_request_model_1.default.aggregate([
            {
                $match: { user: user?._id }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 30 },
            {
                $group: {
                    _id: { location: "$pickupLocation.address" },
                    pickupLocation: { $first: "$pickupLocation" },
                    dropLocation: { $first: "$dropLocation" },
                    createdAt: { $first: "$createdAt" },
                }
            },
            {
                $project: {
                    _id: 0
                }
            },
            { $limit: 5 },
        ]);
        return res.status(200).json({
            error: false,
            msg: 'success',
            data: {
                recent_location: query?.saved_address === "true" ? undefined : latestTrip,
                saved_location: !!query._id ? addresses[0] : addresses
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
exports.getSavedAddress = getSavedAddress;
const delSavedAddress = async (req, res) => {
    try {
        const { query } = req;
        await saved_address_model_1.default.deleteOne({ _id: new mongoose_1.default.Types.ObjectId(query?._id) });
        return res.status(200).json({
            error: false,
            msg: 'deleted successful',
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.delSavedAddress = delSavedAddress;
//# sourceMappingURL=saved_address.controller.js.map