"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
let schema = new mongoose_1.Schema({
    driver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user'
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user'
    },
    trip: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'trip_request'
    },
    rating: Number,
    comment: String,
    active: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const DriverRating = (0, mongoose_1.model)('driver_rating', schema);
exports.default = DriverRating;
//# sourceMappingURL=driver_rating.model.js.map