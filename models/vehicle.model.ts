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
        service_vehicle: {
            type: Schema.Types.ObjectId,
            ref: 'service_vehicle'
        },
        driver: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        name: String,
        model_name: String,
        images: [{
            type: String,
            trim: true
        }],
        active: {
            type: Boolean,
            default: false
        },
        engage: {
            type: Boolean,
            default: false
        },
        position: {
            lat: Number,
            lng: Number
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
            },
            coordinates: {
                type: [Number],
            }
        },
        features: {
            capacity: String,
            color: String,
            fuel_type: String,
            gear_type: String,
            seats: Number,
        },
        documents: [
            {
                key: Schema.Types.Mixed,
                value: Schema.Types.Mixed
            }
        ],
        specifications: {
            max_power: String,
            fuel_per_litre: String,
            max_speed: String,
            mph: String
        },
        approved: {
            type: Boolean,
            default: false
        },

    }, {timestamps: true}
);

schema.index({'location': '2dsphere'})

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Vehicle = model('vehicle', schema);
export default Vehicle;

