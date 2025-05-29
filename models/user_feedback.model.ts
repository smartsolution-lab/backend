import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

let schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        unique: true
    },
    rating: Number,
    comment: String,
    approved: {
        type: Boolean,
        default: false
    }

}, {timestamps: true})

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const UserFeedback =  model('user_feedback', schema)
export default UserFeedback