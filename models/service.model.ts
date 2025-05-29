import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const schema = new Schema({
        categories: [{
            type: Schema.Types.ObjectId,
            ref: 'service_category'
        }],
        service_packages: [{
            type: Schema.Types.ObjectId,
            ref: 'service_package'
        }],
        name: String,
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
const Service = model('service', schema);

export default Service;

