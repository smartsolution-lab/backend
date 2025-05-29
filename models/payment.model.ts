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
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        driver: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        trip: {
            type: Schema.Types.ObjectId,
            ref: 'trip_request',
        },
        amount: {
            type: Number,
            min: 0,
        },
        net_amount: {
            type: Number,
            min: 0,
        },
        payment_method: String,
        description: String,
        status: String,
        tran_id: {
            type: String,
            unique: true,
        },

        // from ssl ipn
        tran_date: {type: Date, default: Date.now()},
        val_id: String,
        store_amount: Number,
        card_type: String,
        card_no: String,
        currency: String,
        bank_tran_id: String,
        card_issuer: String,
        card_brand: String,
        card_issuer_country: String,
        card_issuer_country_code: String,
        currency_type: String,
        currency_amount: String,
        verify_sign: String,
        verify_key: String,
        risk_level: Number,
        risk_title: String,
        sessionkey: String,
        payment: Schema.Types.Mixed,
        tips: Boolean,

    }, {timestamps: true}
)
schema.plugin(autoIncrement.plugin, {
    model: 'payment',
    field: 'ref',
    startAt: 1,
    incrementBy: 1
});
schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Payment = model('payment', schema)
export default Payment