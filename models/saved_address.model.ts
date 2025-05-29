import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    location: {
        lat: Number,
        lng: Number
    },
    address: String,
    address_type: String,

}, {timestamps: true});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const SavedAddress = model('saved_address', schema);

export default SavedAddress;

