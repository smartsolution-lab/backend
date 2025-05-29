import mongoose, { Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'


// schema design
const schema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
    },
    start_date: Date,
    end_date: Date,
   
}, {
    timestamps: true
});


schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Holiday = mongoose.model("holiday", schema);

export default Holiday;
