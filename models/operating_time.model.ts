import mongoose, { Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'


// schema design
const schema = new mongoose.Schema({
    day: String,
    opening_time: Date,
    closing_time: Date,
    status: {
        type: Boolean,
        default: true
    },
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant'
    },
   
}, {
    timestamps: true
});


schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const OperatingTime = mongoose.model("operating_time", schema);

export default OperatingTime;
