"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const files = ['image/jpeg', 'image/webp', 'application/pdf', 'image/png', 'image/jpg', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (files.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new multer_1.default.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
};
// ["image", "jpeg"]
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 52428800, files: 5 },
});
//# sourceMappingURL=fileProcess.js.map