"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
let schema = new mongoose_1.Schema({
    name: String,
    first_name: String,
    middle_name: String,
    last_name: String,
    username: {
        type: String,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
    },
    fax: {
        type: String,
        trim: true
    },
    birthday: Date,
    joining_date: Date,
    id_number: String,
    department: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'department',
    },
    permission: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'role',
    },
    country: String,
    city: String,
    area: String,
    street: String,
    building: String,
    gender: String,
    door: String,
    address1: String,
    address2: String,
    state: String,
    postcode: String,
    image: String,
    otp: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'driver', 'employee'],
    },
    marketing_status: {
        type: String,
        default: 'active',
        enum: ['active', 'banned']
    },
    verified: {
        type: Boolean,
        default: false,
    },
    active: {
        type: Boolean,
        default: false,
    },
    vehicle: { type: mongoose_1.Schema.Types.ObjectId, ref: 'vehicle' },
    balance: Number,
    key: {
        type: String,
        trim: true
    },
    ticket_departments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'ticket_department',
        }],
    ticket_categories: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'ticket_department',
        }],
    ticket_types: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'ticket_type',
        }],
    assigned_ticket: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ticket' }],
        default: []
    },
    fcm_token: [String],
    push_notification_status: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const User = (0, mongoose_1.model)('user', schema);
exports.default = User;
//# sourceMappingURL=user.model.js.map