"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose_1.connection);
let schema = new mongoose_1.Schema({
    ref: {
        type: Number,
        unique: true
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
    },
    driver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
    },
    trip: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'trip_request',
    },
    amount: {
        type: Number,
        min: 0,
    },
    net_amount: {
        type: Number,
        min: 0,
    },
    payment_method: String,
    description: String,
    status: String,
    tran_id: {
        type: String,
        unique: true,
    },
    // from ssl ipn
    tran_date: { type: Date, default: Date.now() },
    val_id: String,
    store_amount: Number,
    card_type: String,
    card_no: String,
    currency: String,
    bank_tran_id: String,
    card_issuer: String,
    card_brand: String,
    card_issuer_country: String,
    card_issuer_country_code: String,
    currency_type: String,
    currency_amount: String,
    verify_sign: String,
    verify_key: String,
    risk_level: Number,
    risk_title: String,
    sessionkey: String,
    payment: mongoose_1.Schema.Types.Mixed,
    tips: Boolean,
}, { timestamps: true });
schema.plugin(autoIncrement.plugin, {
    model: 'payment',
    field: 'ref',
    startAt: 1,
    incrementBy: 1
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Payment = (0, mongoose_1.model)('payment', schema);
exports.default = Payment;
//# sourceMappingURL=payment.model.js.map