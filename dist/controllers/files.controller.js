"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const awsS3Bucket_1 = require("../utils/awsS3Bucket");
const uploadFiles = async (req, res, next) => {
    try {
        const { _id } = res.locals.user || {};
        const user = await user_model_1.default.findById(_id);
        if (!user) {
            return res.status(500).json({
                error: true,
                msg: "Permission Denied"
            });
        }
        const results = (await (0, awsS3Bucket_1.s3Upload)(req.files, user?.phone)).map(d => d.Location);
        return res.status(200).json({
            error: false,
            msg: 'File uploaded successfully!',
            data: results
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.uploadFiles = uploadFiles;
//# sourceMappingURL=files.controller.js.map