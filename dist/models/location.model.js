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
    name: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    location_type: {
        type: String,
        enum: ['point', 'polygon'],
    },
    location: mongoose_1.Schema.Types.Mixed,
    timezone: {
        abbrev: String,
        altName: String,
        label: String,
        offset: String,
        value: String,
    },
    distance_unit: String,
    active: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });
schema.index({ "location": "2dsphere" });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Location = (0, mongoose_1.model)('location', schema);
exports.default = Location;
//# sourceMappingURL=location.model.js.map