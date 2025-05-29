import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2"

let schema = new Schema({
        name: {
            type: String,
            unique: true,
        },
        image: String,
        active: {
            type: Boolean,
            default: true
        },
        description: String,
    }, {timestamps: true}
)

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const ServiceCategory = model('service_category', schema)
export default ServiceCategory