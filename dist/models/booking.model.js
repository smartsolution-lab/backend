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
    },
    dropLocation: {
        lat: Number,
        lng: Number,
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
        enum: ['pending', 'accepted', 'declined', 'confirmed'],
        default: 'pending'
    },
    date: Date,
    time: Date,
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Booking = (0, mongoose_1.model)('booking', schema);
exports.default = Booking;
//# sourceMappingURL=booking.model.js.map