import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'


// schema design
const schema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
    },
    days: {
        type: Number,
        trim: true,
        required: true,
    },
    type: {
        type: String,
        trim: true,
        enum: ['paid','non_paid'],
        required: true,
    },
    icon: {
        type: String,
        trim: true,
    },
    status: {
        type: Boolean,
        default: true,
    },

}, {
    timestamps: true
});


schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const LeaveSetting = mongoose.model("leave_setting", schema);

export default LeaveSetting;
