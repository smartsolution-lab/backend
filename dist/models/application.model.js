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
    user: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'user',
    },
    vehicle: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'vehicle',
        required: true,
    },
    registration: {},
    status: {
        type: String,
        enum: ['active', "inactive"],
        default: "inactive"
    }
}, {
    timestamps: true
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Application = mongoose_1.default.model("application", schema);
exports.default = Application;
//# sourceMappingURL=application.model.js.map