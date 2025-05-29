import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

let schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    pickupLocation: {
        lat: Number,
        lng: Number,
    },
    dropLocation: {
        lat: Number,
        lng: Number,
    },
    distance: Number,
    subtotal: Number,
    vat: Number,
    total: Number,
    discount: {
        amount: Number,
        code: String
    },
    payment_method: {
        logo: String,
        name: String
    },
    vehicle: {
        type: Schema.Types.ObjectId,
        ref: 'vehicle'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'confirmed'],
        default: 'pending'
    },

    date: Date,
    time: Date,

}, {timestamps: true})

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Booking = model('booking', schema);

export default Booking