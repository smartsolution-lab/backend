import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const schema = new Schema({
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

}, {timestamps: true});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const PayrollSalarySetting = model('payroll_salary_setting', schema);

export default PayrollSalarySetting;

