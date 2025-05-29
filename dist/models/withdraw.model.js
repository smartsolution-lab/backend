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
    amount: {
        type: Number,
        default: 0
    },
    by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
    },
    trx_id: String,
    approved: {
        type: Boolean,
        default: false
    },
    payment_accept: {
        method_name: String,
        account_details: String,
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'cancelled', 'processing'],
        default: 'pending'
    },
    description: String,
    invoice: String
}, { timestamps: true });
schema.plugin(autoIncrement.plugin, {
    model: 'withdraw',
    field: 'ref',
    startAt: 1,
    incrementBy: 1
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Withdraw = (0, mongoose_1.model)('withdraw', schema);
exports.default = Withdraw;
//# sourceMappingURL=withdraw.model.js.map