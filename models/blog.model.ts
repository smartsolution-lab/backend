import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

let schema = new Schema({
    cover_image: String,
    heading: String,
    short_info: String,
    type:{
        type: String,
        enum: ['blog', 'press'],
        default: 'blog'
    },
    details: String,
    date: {
        type: Date,
        default: Date.now()
    },
    timeToRead: String,
    tags: [String],
    lang: String,

}, {timestamps: true})

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Blog =  model('blog', schema)
export default Blog
