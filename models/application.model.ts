import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

// schema design
const schema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
    },
    vehicle: {
        type: mongoose.Types.ObjectId,
        ref: 'vehicle',
        required: true,
    },
    registration: {},
    status: {
        type: String,
        enum: ['active', "inactive"],
        default: "inactive"
    }

}, {
    timestamps: true
});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Application = mongoose.model("application", schema);

export default Application;
