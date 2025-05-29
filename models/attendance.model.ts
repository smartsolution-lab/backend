import mongoose, { Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'


// schema design
const schema = new mongoose.Schema({
    employee_key: {
        type: String,
    },
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    restaurant_id: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant'
    },
    start_time: Date,
    end_time: Date,
    date: Date,

    break_time_start: Date,
    break_time_end: Date,

    status: {
        type: String,
        enum: ['completed','in','out'],
        default: 'completed',
    },
   
}, {
    timestamps: true
});


schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Attendance = mongoose.model("attendance", schema);

export default Attendance;
