import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const schema = new Schema({
    employee_id: {
        type: Schema.Types.ObjectId,
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
                type: Schema.Types.ObjectId,
                ref: 'payroll_salary_setting'
            },
            value: Number
        }
    ]

}, {timestamps: true});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const PayrollEmployeeSalary = model('payroll_employee_salary', schema);

export default PayrollEmployeeSalary;

