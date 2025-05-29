import { model, Schema } from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'


// schema design
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    value: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        enum: ['percentage', 'amount'],
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['disabled', 'active'],
        default: 'disabled'
    },
    coupon_description: {
        type: String,
        trim: true,
        minlength: 0,
        maxlength: 500
    },
    coupon_minimum_amount: {
        type: String,
        trim: true,
        minlength: 0,
    },
    start_duration: {
        type: Date,
        trim: true,
    },
    end_duration: {
        type: Date,
        trim: true,
    }

}, {
    timestamps: true
});


schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Coupon = model("coupon", schema);

export default Coupon;