import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

// schema design
const schema = new mongoose.Schema({
    service_category: {
        type: mongoose.Types.ObjectId,
        ref: 'service_category',
    },
    section_title: {
        type: String,
        trim: true,
    },
    section_sub_title: {
        type: String,
        trim: true,
    },
    brief_info: [
        {
            title: String,
            information: String,
        }
    ],
    heading: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const CategoryInfo = mongoose.model("category_info", schema);

export default CategoryInfo;
