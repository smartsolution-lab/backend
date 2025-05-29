import {model, Schema} from "mongoose";

let schema = new Schema({
    section_1: {
        title: String,
        description: String,
    },
    section_3: {
        title: String,
        description: String,
    },
    required: [
        {
            title: String,
            description: String,
        }
    ],

}, {timestamps: true})

const EarnWithShare =  model('earn_with_share', schema)
export default EarnWithShare