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
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'department',
        }
    }, {timestamps: true}
)

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Department = model('department', schema)
export default Department