import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const schema = new Schema({
    department: {
        type: Schema.Types.ObjectId,
        ref: 'department'
    },
    designation: {
        type: Schema.Types.ObjectId,
        ref: 'role'
    },
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    amount: {
        type: Number,
        min: 0
    },
    advance_for: String,
    date: String,

}, {timestamps: true});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const PayrollAdvanceSalary = model('payroll_advance_salary', schema);

export default PayrollAdvanceSalary;

