import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

let schema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: false,
    },
    message: {
        type: String,
        required: true,
    },
    delivered: {
        type: Boolean,
        default: false
    },
    seen: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})
schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Message = model('message', schema)
export default Message