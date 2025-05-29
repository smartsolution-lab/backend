import {model, Schema} from 'mongoose';
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

let schema = new Schema({
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    trip: {
        type: Schema.Types.ObjectId,
        ref: 'trip_request',
    },
    amount: {
        type: Number,
        min: 0
    }

}, {timestamps: true});

schema.plugin(paginate);
schema.plugin(aggregatePaginate);
const DriverBalance =  model('driver_balance', schema);

export default DriverBalance