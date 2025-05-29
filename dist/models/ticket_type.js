"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const schema = new mongoose_1.Schema({
    departments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'ticket_department'
        }],
    categories: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'ticket_department'
        }],
    name: {
        type: String,
        unique: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const TicketType = (0, mongoose_1.model)('ticket_type', schema);
exports.default = TicketType;
//# sourceMappingURL=ticket_type.js.map