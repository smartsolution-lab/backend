import {connection, model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(connection);

let schema = new Schema({
        ref: {
            type: Number,
            unique: true
        },
        amount: {
            type: Number,
            default: 0
        },
        by: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        trx_id: String,
        approved: {
            type: Boolean,
            default: false
        },
        payment_accept: {
            method_name: String,
            account_details: String,
        },
        status: {
            type: String,
            enum: ['completed', 'pending', 'cancelled', 'processing'],
            default: 'pending'
        },
        description: String,
        invoice: String
    }, {timestamps: true}
)
schema.plugin(autoIncrement.plugin, {
    model: 'withdraw',
    field: 'ref',
    startAt: 1,
    incrementBy: 1
});
schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Withdraw = model('withdraw', schema)
export default Withdraw