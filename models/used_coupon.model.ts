import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

let schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    coupon_code: {
        type: String,
        trim: true,
        lowercase: true,
    },
    used: {
        type: Number,
        min: 0
    }
}, {timestamps: true})

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const UsedCoupon = model('used_coupon', schema)
export default UsedCoupon