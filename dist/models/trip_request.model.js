"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
let schema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user'
    },
    driver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user'
    },
    pickupLocation: {
        lat: Number,
        lng: Number,
        address: String,
        location_type: {
            type: String,
            lowercase: true
        }
    },
    dropLocation: {
        lat: Number,
        lng: Number,
        address: String,
        location_type: {
            type: String,
            lowercase: true
        }
    },
    distance: Number,
    subtotal: Number,
    vat: Number,
    total: Number,
    discount: {
        amount: Number,
        code: String
    },
    payment_method: {
        logo: String,
        name: String
    },
    vehicle: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'vehicle'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', "moving", "start", 'completed', 'trip_cancelled'],
        default: 'pending'
    },
    payments: [{
            _id: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'payment'
            },
            method: String,
            amount: Number,
        }],
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const TripRequest = (0, mongoose_1.model)('trip_request', schema);
exports.default = TripRequest;
//# sourceMappingURL=trip_request.model.js.map