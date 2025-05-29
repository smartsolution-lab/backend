"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
let schema = new mongoose_1.Schema({
    phone: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    code: String,
    action: String,
    attempts: {
        type: Number,
        default: 3,
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: '2m' },
    }
}, { timestamps: true });
const OTP = (0, mongoose_1.model)('otp', schema);
exports.default = OTP;
//# sourceMappingURL=otp.model.js.map