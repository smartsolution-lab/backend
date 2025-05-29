"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delServicePackage = exports.getServicePackage = exports.getServicePackages = exports.postServicePackage = void 0;
const service_package_model_1 = __importDefault(require("../models/service_package.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// post ServicePackage
const postServicePackage = async (req, res, next) => {
    try {
        const { body } = req;
        const { user } = res.locals;
        if (!!body._id) {
            await service_package_model_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        delete body._id;
        const response = await service_package_model_1.default.create({ ...body });
        return res.status(200).json({
            error: false,
            msg: 'Successfully created!',
            data: response
        });
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
            msg: "Server side error"
        });
    }
};
exports.postServicePackage = postServicePackage;
const getServicePackages = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { "name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const servicePackages = await service_package_model_1.default.aggregatePaginate(service_package_model_1.default.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
        });
        return res.status(200).json({
            error: false,
            data: servicePackages
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.getServicePackages = getServicePackages;
const getServicePackage = async (req, res, next) => {
    try {
        const { query } = req;
        const servicePackage = await service_package_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(query._id) });
        return res.status(200).json({
            error: false,
            data: servicePackage
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.getServicePackage = getServicePackage;
// delete ServicePackage
const delServicePackage = async (req, res, next) => {
    try {
        const { query } = req;
        await service_package_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.delServicePackage = delServicePackage;
//# sourceMappingURL=service_package.controller.js.map