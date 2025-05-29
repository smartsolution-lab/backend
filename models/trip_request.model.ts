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
        address: String,
        location_type: {
            type: String,
            lowercase: true
        }
    },
    dropLocation: {
        lat: Number,
        lng: Number,
        address: String,
        location_type: {
            type: String,
            lowercase: true
        }
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
        enum: ['pending', 'accepted', 'declined', "moving", "start", 'completed', 'trip_cancelled'],
        default: 'pending'
    },
    payments: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'payment'
        },
        method: String,
        amount: Number,
    }],

}, {timestamps: true})

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const TripRequest = model('trip_request', schema)
export default TripRequest