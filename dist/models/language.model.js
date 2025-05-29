"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
let schema = new mongoose_1.Schema({
    name: String,
    code: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    flag: String,
    rtl: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    default: {
        type: Boolean,
        default: false
    },
    translation: [{
            key: String,
            value: String
        }]
}, { timestamps: true });
const Language = (0, mongoose_1.model)('language', schema);
exports.default = Language;
//# sourceMappingURL=language.model.js.map