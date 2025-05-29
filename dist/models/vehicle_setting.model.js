"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const schema = new mongoose_1.Schema({
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'service'
    },
    name: {
        type: String,
    },
    models: [
        {
            name: { type: String }
        }
    ],
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const VehicleSetting = (0, mongoose_1.model)('vehicle_setting', schema);
exports.default = VehicleSetting;
//# sourceMappingURL=vehicle_setting.model.js.map