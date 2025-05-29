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
    service_category: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'service_category',
    },
    section_title: {
        type: String,
        trim: true,
    },
    section_sub_title: {
        type: String,
        trim: true,
    },
    brief_info: [
        {
            title: String,
            information: String,
        }
    ],
    heading: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const CategoryInfo = mongoose_1.default.model("category_info", schema);
exports.default = CategoryInfo;
//# sourceMappingURL=category_info.model.js.map