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
    start_work: Date,
    end_work: Date,
    start_break: Date,
    end_break: Date,
    weekends: [String],
}, {
    timestamps: true
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const AttendanceSetting = mongoose_1.default.model("attendance_setting", schema);
exports.default = AttendanceSetting;
//# sourceMappingURL=attendance_setting.model.js.map