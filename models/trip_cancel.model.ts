import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

let schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    vehicle: {
        type: Schema.Types.ObjectId,
        ref: 'vehicle'
    },
    reason: String,

}, {timestamps: true})

schema.plugin(paginate);
schema.plugin(aggregatePaginate);
const TripCancelReason = model('trip_cancel_reason', schema);
export default TripCancelReason