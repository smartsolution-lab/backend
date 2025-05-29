"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const schema = new mongoose_1.Schema({
    employee_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user'
    },
    hourly_basis_salary_allow: Boolean,
    hourly_rate: String,
    is_over_time_allow: Boolean,
    over_time_rate: Number,
    absent_deduct_allow: Boolean,
    absent_deduct_rate: Number,
    basic_salary: Number,
    net_salary: String,
    categories: [
        {
            salary_settings_id: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'payroll_salary_setting'
            },
            value: Number
        }
    ]
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const PayrollEmployeeSalary = (0, mongoose_1.model)('payroll_employee_salary', schema);
exports.default = PayrollEmployeeSalary;
//# sourceMappingURL=payroll_employee_salary.js.map