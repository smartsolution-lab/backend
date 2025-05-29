"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
var GeoJSON = require('mongoose-geojson-schema');
let schema = new mongoose_1.Schema({
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
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const MarketingSettings = (0, mongoose_1.model)('marketing_setting', schema);
exports.default = MarketingSettings;
//# sourceMappingURL=marketing_setting.model.js.map