import {model, Schema} from 'mongoose';
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

let schema = new Schema({
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    trip: {
        type: Schema.Types.ObjectId,
        ref: 'trip_request'
    },
    rating: Number,
    comment: String,
    active: {
        type: Boolean,
        default: false
    }

}, {timestamps: true});

schema.plugin(paginate);
schema.plugin(aggregatePaginate);
const DriverRating =  model('driver_rating', schema);

export default DriverRating