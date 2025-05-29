import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

var GeoJSON = require('mongoose-geojson-schema');

let schema = new Schema({
    individual_mail:String,
    group: {type: Schema.Types.ObjectId,ref:'marketing_group'},
    status: {
        type: String,
        default: 'pending'
    },
    scheduled_date : String,
    subject: String,
    content: String,
    from: String,

    subscriber:Boolean,
    driver: Boolean,
    user: Boolean,
    employee: Boolean,
    to:{
        type:[],
        default:[]
    }
}, {timestamps: true})

schema.plugin(paginate);
schema.plugin(aggregatePaginate);

const MarketingMail = model('marketing_mail', schema)

export default MarketingMail
