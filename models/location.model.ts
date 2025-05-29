import { model, Schema } from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
var GeoJSON = require('mongoose-geojson-schema');


let schema = new Schema({
    name: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    location_type: {
        type: String,
        enum: ['point', 'polygon'],
    },
    location: Schema.Types.Mixed,
    timezone: {
        abbrev: String,
        altName: String,
        label: String,
        offset: String,
        value: String,
    },
    distance_unit: String,
    active: {
        type: Boolean,
        default: true,
    }

}, { timestamps: true })

schema.index({"location": "2dsphere"});
schema.plugin(paginate);
schema.plugin(aggregatePaginate);

const Location = model('location', schema)

export default Location