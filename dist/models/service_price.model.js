"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
// schema design
const schema = new mongoose_1.default.Schema({
    category: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'service_category',
    },
    service_package: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'service_package',
    },
    service: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'service',
    },
    service_vehicle: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'service_vehicle',
        // unique: true
    },
    currency: {
        type: String,
        trim: true,
    },
    base_fair: {
        type: Number,
        min: 0,
    },
    per_kilo_charge: {
        type: Number,
        min: 0,
    },
    waiting_charge: {
        type: Number,
        min: 0,
    },
    minimum_fair: {
        type: Number,
        min: 0,
    },
    cancellation_fee: {
        type: Number,
        min: 0,
    },
    commission_type: {
        type: String,
        enum: ["fixed_amount", "percentage"],
        trim: true,
    },
    company_commission: {
        type: Number,
        min: 0,
    },
    additional_fees: [
        {
            additional_fee_name: String,
            additional_fee: Number,
        },
    ]
}, {
    timestamps: true
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const ServicePrice = mongoose_1.default.model("service_price", schema);
exports.default = ServicePrice;
//# sourceMappingURL=service_price.model.js.map