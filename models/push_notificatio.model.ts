import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

var GeoJSON = require('mongoose-geojson-schema');

let schema = new Schema({
    group: {type:Schema.Types.ObjectId,ref:'group'},
    status: {
        type: String,
        enum: ['sent','scheduled', 'failed'],
        default: 'sent'
    },
    to_users:String,
    scheduled_date : String,
    title: String,
    body: String,

}, {timestamps: true})


schema.plugin(paginate);
schema.plugin(aggregatePaginate);

const PushNotification = model('push_notification', schema)

export default PushNotification