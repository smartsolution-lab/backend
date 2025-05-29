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
    type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        trim: true
    },
    status: {
        type: Boolean,
        default: true
    },
    groups: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "user"
        }]
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const MarketingGroup = (0, mongoose_1.model)('marketing_group', schema);
exports.default = MarketingGroup;
//# sourceMappingURL=marketing_group.model.js.map