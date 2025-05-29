"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
let schema = new mongoose_1.Schema({
    from: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    to: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'user',
        required: false,
    },
    message: {
        type: String,
        required: true,
    },
    delivered: {
        type: Boolean,
        default: false
    },
    seen: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Message = (0, mongoose_1.model)('message', schema);
exports.default = Message;
//# sourceMappingURL=message.model.js.map