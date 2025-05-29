"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileRoutes = express_1.default.Router();
const files_controller_1 = require("../../controllers/files.controller");
const fileProcess_1 = require("../../utils/fileProcess");
// const multiUpload = upload.fields([
//   { name: "profile_image", maxCount: 1 },
//   { name: "t2202a_form", maxCount: 1 },
//   { name: "notice_of_assessment", maxCount: 1 },
//   { name: "direct_deposit_form", maxCount: 1 },
//   { name: "drivers_license", maxCount: 1 },
//   { name: "uber_summary_pic", maxCount: 1 },
//   { name: "t4s", maxCount: 10 },
// ]);
// post 
fileRoutes.post('/aws', fileProcess_1.upload.any(), files_controller_1.uploadFiles);
exports.default = fileRoutes;
//# sourceMappingURL=files.routes.js.map