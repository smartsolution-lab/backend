"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAreaCheckInsideOfMap = exports.delLocation = exports.getLocationList = exports.postLocation = void 0;
const geo_coder_1 = require("../utils/geo_coder");
const location_model_1 = __importDefault(require("../models/location.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// post location
const postLocation = async (req, res, next) => {
    try {
        const { body } = req;
        console.log(body);
        if (body._id) {
            await location_model_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            delete body._id;
            const polygon = new location_model_1.default({
                name: body.name,
                address: body.address,
                state: body.state,
                country: body.country,
                timezone: body.timezone,
                distance_unit: body.distance_unit,
                location_type: 'polygon',
                location: body.location,
                active: body.active,
            });
            await polygon.save();
            return res.status(200).json({
                error: false,
                msg: 'The location has been successfully added',
            });
        }
    }
    catch (error) {
        console.log(error);
        if (error.code === 11000) {
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
exports.postLocation = postLocation;
// get location
const getLocationList = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { address: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const locations = await location_model_1.default.aggregatePaginate(location_model_1.default.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ]));
        return res.status(200).json({
            error: false,
            data: locations
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.getLocationList = getLocationList;
// delete location
const delLocation = async (req, res, next) => {
    try {
        const { query } = req;
        await location_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Location Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.delLocation = delLocation;
// check user location inside of map area, according to user location (Point type)
const userAreaCheckInsideOfMap = async (req, res, next) => {
    try {
        const { body } = req;
        const loc = await geo_coder_1.geocoder.geocode(body.address);
        const location = {
            type: 'Point',
            coordinates: [loc[0].longitude, loc[0].latitude],
            formattedAddress: loc[0].formattedAddress
        };
        const longitude = location.coordinates[0];
        const latitude = location.coordinates[1];
        const findNearLoc = await location_model_1.default.find({
            location: { $geoIntersects: { $geometry: { type: 'Point', coordinates: [longitude, latitude] } } }
        });
        return res.status(200).json({
            error: false,
            location,
            longitude,
            latitude,
            findNearLoc
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.userAreaCheckInsideOfMap = userAreaCheckInsideOfMap;
//# sourceMappingURL=locations.controller.js.map