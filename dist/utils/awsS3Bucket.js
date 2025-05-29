"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Upload = void 0;
const aws_sdk_1 = require("aws-sdk");
const crypto_1 = __importDefault(require("crypto"));
const s3Upload = async (files, self_folder) => {
    const s3 = new aws_sdk_1.S3();
    const randNumber = crypto_1.default.randomBytes(8).toString("hex");
    const params = files.map((file) => {
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${process.env.WEBSITE_NAME}-storage/${self_folder}/${randNumber}-${file.originalname}`,
            Body: file.buffer,
        };
    });
    return await Promise.all(params.map((param) => s3.upload(param).promise()));
};
exports.s3Upload = s3Upload;
//# sourceMappingURL=awsS3Bucket.js.map