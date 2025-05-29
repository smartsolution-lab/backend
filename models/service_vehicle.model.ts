import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const schema = new Schema({
        service_category: {
            type: Schema.Types.ObjectId,
            ref: 'service_category'
        },
        service_package: {
            type: Schema.Types.ObjectId,
            ref: 'service_package'
        },
        service: {
            type: Schema.Types.ObjectId,
            ref: 'service'
        },
        name: {
            type: Schema.Types.ObjectId,
            ref: 'vehicle_setting'
        },
        vehicle_model: String,
        image: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },

    }, {timestamps: true}
);

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const ServiceVehicle = model('service_vehicle', schema);
export default ServiceVehicle;

