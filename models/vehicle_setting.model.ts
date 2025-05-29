import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const schema = new Schema({
    service: {
        type: Schema.Types.ObjectId,
        ref: 'service'
    },
    name: {
        type: String,
    },
    models: [
        {
            name: {type: String}
        }
    ],
}, {timestamps: true});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const VehicleSetting = model('vehicle_setting', schema);
export default VehicleSetting;

