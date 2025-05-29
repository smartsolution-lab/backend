import {connection, model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

let schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    amount: {
        type: Number,
        min: 0,
    },
    deposit_method: String
}, {timestamps: true})

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Wallet = model('wallet', schema)

export default Wallet