import { model, Schema } from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
var GeoJSON = require('mongoose-geojson-schema');


let schema = new Schema({
    type:{
        type:String,
        required:true
    },
    name: {
        type: String,
        trim: true
    },
    status:{
        type: Boolean,
        default: true
    },
    groups: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }]

}, { timestamps: true })

schema.plugin(paginate);
schema.plugin(aggregatePaginate);

const MarketingGroup = model('marketing_group', schema)

export default MarketingGroup