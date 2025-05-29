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
    title: {
        type: String,
        trim: true,
        required: true,
    },
    start_date: Date,
    end_date: Date,
}, {
    timestamps: true
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Holiday = mongoose_1.default.model("holiday", schema);
exports.default = Holiday;
//# sourceMappingURL=holiday.model.js.map