"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postContuctUsInfo = exports.getEarnWithShare = exports.postEarnWithShare = exports.delLandingPage = exports.getLandingPage = exports.postLandingPage = void 0;
const landing_page_model_1 = __importDefault(require("../models/landing_page.model"));
const earn_with_share_model_1 = __importDefault(require("../models/earn_with_share.model"));
const contact_us_info_model_1 = __importDefault(require("../models/contact_us_info.model"));
// post LandingPage
const postLandingPage = async (req, res, next) => {
    try {
        const { body } = req;
        console.log(body);
        if (body._id) {
            await landing_page_model_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            delete body._id;
            await landing_page_model_1.default.create(req.body);
            return res.status(200).json({
                error: false,
                msg: 'Successfully created'
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postLandingPage = postLandingPage;
// get LandingPage
const getLandingPage = async (req, res, next) => {
    try {
        const frontendData = await landing_page_model_1.default.findOne({});
        return res.status(200).json({
            error: false,
            data: frontendData
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getLandingPage = getLandingPage;
// delete LandingPage
const delLandingPage = async (req, res, next) => {
    try {
        const { query } = req;
        await landing_page_model_1.default.findByIdAndDelete(query._id);
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
exports.delLandingPage = delLandingPage;
/**
 *
 * Earn with share
 */
const postEarnWithShare = async (req, res, next) => {
    try {
        const { body } = req;
        if (body._id) {
            await earn_with_share_model_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            delete body._id;
            await earn_with_share_model_1.default.create(req.body);
            return res.status(200).json({
                error: false,
                msg: 'Successfully created'
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postEarnWithShare = postEarnWithShare;
const getEarnWithShare = async (req, res, next) => {
    try {
        const frontendData = await earn_with_share_model_1.default.findOne({});
        return res.status(200).json({
            error: false,
            data: frontendData
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getEarnWithShare = getEarnWithShare;
const postContuctUsInfo = async (req, res, next) => {
    try {
        await contact_us_info_model_1.default.create(req.body);
        return res.status(200).json({
            error: false,
            msg: 'Message Received'
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postContuctUsInfo = postContuctUsInfo;
//# sourceMappingURL=frontend.controller.js.map