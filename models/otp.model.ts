import {model, Schema} from "mongoose";

let schema = new Schema({
    phone: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    code: String,
    action: String,
    attempts: {
        type: Number,
        default: 3,
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: {expires: '2m'},
    }
}, {timestamps: true})

const OTP =  model('otp', schema)
export default OTP