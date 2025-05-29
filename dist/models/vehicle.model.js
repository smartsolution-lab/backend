"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const schema = new mongoose_1.Schema({
    service_category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'service_category'
    },
    service_package: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'service_package'
    },
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'service'
    },
    service_vehicle: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'service_vehicle'
    },
    driver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user'
    },
    name: String,
    model_name: String,
    images: [{
            type: String,
            trim: true
        }],
    active: {
        type: Boolean,
        default: false
    },
    engage: {
        type: Boolean,
        default: false
    },
    position: {
        lat: Number,
        lng: Number
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    features: {
        capacity: String,
        color: String,
        fuel_type: String,
        gear_type: String,
        seats: Number,
    },
    documents: [
        {
            key: mongoose_1.Schema.Types.Mixed,
            value: mongoose_1.Schema.Types.Mixed
        }
    ],
    specifications: {
        max_power: String,
        fuel_per_litre: String,
        max_speed: String,
        mph: String
    },
    approved: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });
schema.index({ 'location': '2dsphere' });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Vehicle = (0, mongoose_1.model)('vehicle', schema);
exports.default = Vehicle;
//# sourceMappingURL=vehicle.model.js.map