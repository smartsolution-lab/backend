"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const schema = new mongoose_1.Schema({
    assign_to: mongoose_1.Schema.Types.ObjectId,
    status: {
        type: String,
        enum: ['pending', 'open', 'closed'],
        default: 'pending'
    },
    answered: {
        type: Boolean,
        default: false
    },
    name: String,
    email: String,
    subject: String,
    body: String,
    department: mongoose_1.Schema.Types.ObjectId,
    category: mongoose_1.Schema.Types.ObjectId,
    type: mongoose_1.Schema.Types.ObjectId,
    priorities: mongoose_1.Schema.Types.ObjectId,
    notes: {
        type: [
            {
                title: String,
                description: String,
                user: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: 'user'
                },
                createdTime: {
                    type: Date,
                    default: Date.now
                }
            },
        ],
        default: []
    },
    files: [],
    created_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    assigned_to: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user'
    },
    messages: {
        type: [
            {
                message: String,
                user: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: 'user'
                },
                createdTime: {
                    type: Date,
                    default: Date.now
                }
            },
        ],
        default: []
    },
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Ticket = (0, mongoose_1.model)('ticket', schema);
exports.default = Ticket;
//# sourceMappingURL=ticket.model.js.map