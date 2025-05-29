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
    individual_mail: String,
    group: { type: mongoose_1.Schema.Types.ObjectId, ref: 'marketing_group' },
    status: {
        type: String,
        default: 'pending'
    },
    scheduled_date: String,
    subject: String,
    content: String,
    from: String,
    subscriber: Boolean,
    driver: Boolean,
    user: Boolean,
    employee: Boolean,
    to: {
        type: [],
        default: []
    }
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const MarketingMail = (0, mongoose_1.model)('marketing_mail', schema);
exports.default = MarketingMail;
//# sourceMappingURL=marketing_mails.model.js.map