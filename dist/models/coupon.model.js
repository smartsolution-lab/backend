"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
// schema design
const schema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    value: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        enum: ['percentage', 'amount'],
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['disabled', 'active'],
        default: 'disabled'
    },
    coupon_description: {
        type: String,
        trim: true,
        minlength: 0,
        maxlength: 500
    },
    coupon_minimum_amount: {
        type: String,
        trim: true,
        minlength: 0,
    },
    start_duration: {
        type: Date,
        trim: true,
    },
    end_duration: {
        type: Date,
        trim: true,
    }
}, {
    timestamps: true
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Coupon = (0, mongoose_1.model)("coupon", schema);
exports.default = Coupon;
//# sourceMappingURL=coupon.model.js.map