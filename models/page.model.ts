import {model, Schema} from "mongoose";

const schema = new Schema({
    title: String,
    type: String,
    page: {
        type: String,
        unique: true,
        required: true,
    },
    content: [{
        type: {
            type: String,
        },
        key: String,
        value: String,
        lang: String,
    }]
}, {timestamps: true})

const Page = model('page', schema);
export default Page