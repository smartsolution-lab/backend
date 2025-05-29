"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
// schema design
const schema = new mongoose_1.default.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
    },
    days: {
        type: Number,
        trim: true,
        required: true,
    },
    type: {
        type: String,
        trim: true,
        enum: ['paid', 'non_paid'],
        required: true,
    },
    icon: {
        type: String,
        trim: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const LeaveSetting = mongoose_1.default.model("leave_setting", schema);
exports.default = LeaveSetting;
//# sourceMappingURL=leave_setting.model.js.map