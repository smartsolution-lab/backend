import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

var GeoJSON = require('mongoose-geojson-schema');

let schema = new Schema({
    read: {
        type: Boolean,
        default: false
    },
    type:String,
    title: String,
    message: String,
    data: Object,
    user_id: String,

}, {timestamps: true})

schema.plugin(paginate);
schema.plugin(aggregatePaginate);
const Notification = model('notification', schema)
export default Notification

