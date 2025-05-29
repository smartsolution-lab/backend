"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const schema = new mongoose_1.Schema({
    title: {
        type: String,
        trim: true
    },
    value: {
        type: Number,
        min: 0
    },
    value_type: {
        type: String,
        enum: ['percentage', 'flat']
    },
    setting_type: {
        type: String,
        enum: ['addition', 'subtraction']
    },
    status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const PayrollSalarySetting = (0, mongoose_1.model)('payroll_salary_setting', schema);
exports.default = PayrollSalarySetting;
//# sourceMappingURL=payroll_salary_setting.model.js.map