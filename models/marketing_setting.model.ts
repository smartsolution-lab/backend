import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

var GeoJSON = require('mongoose-geojson-schema');


let schema = new Schema({
    email: {
        default: String,
        sendgrid: {
            host: String,
            port: String,
            username: String,
            password: String,
            sender_email: String,
        },
        gmail: {
            auth_email: String,
            password: String,
            service_provider: String,
        },
        other: {
            host: String,
            port: String,
            address: String,
            password: String,
            provider_name: String,
        },

    },
    email_template: [],
    sms: {
        twilio_auth_token: String,
        twilio_sender_number: String,
        twilio_account_sid: String,
        active: {
            type: Boolean,
            default: false
        },
    },
    whatsapp: {
        twilio_auth_token: String,
        twilio_sender_number: String,
        twilio_account_sid: String,
        active: {
            type: Boolean,
            default: false
        },
    },


}, {timestamps: true})

schema.plugin(paginate);
schema.plugin(aggregatePaginate);

const MarketingSettings = model('marketing_setting', schema)

export default MarketingSettings
