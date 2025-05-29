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
    group: { type: mongoose_1.Schema.Types.ObjectId, ref: 'group' },
    status: {
        type: String,
        enum: ['sent', 'scheduled', 'failed'],
        default: 'sent'
    },
    to_users: String,
    scheduled_date: String,
    title: String,
    body: String,
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const PushNotification = (0, mongoose_1.model)('push_notification', schema);
exports.default = PushNotification;
//# sourceMappingURL=push_notificatio.model.js.map