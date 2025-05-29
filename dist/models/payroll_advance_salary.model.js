"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const schema = new mongoose_1.Schema({
    department: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'department'
    },
    designation: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'role'
    },
    employee: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user'
    },
    amount: {
        type: Number,
        min: 0
    },
    advance_for: String,
    date: String,
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const PayrollAdvanceSalary = (0, mongoose_1.model)('payroll_advance_salary', schema);
exports.default = PayrollAdvanceSalary;
//# sourceMappingURL=payroll_advance_salary.model.js.map