"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
let schema = new mongoose_1.Schema({
    cover_image: String,
    heading: String,
    short_info: String,
    type: {
        type: String,
        enum: ['blog', 'press'],
        default: 'blog'
    },
    details: String,
    date: {
        type: Date,
        default: Date.now()
    },
    timeToRead: String,
    tags: [String],
    lang: String,
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const Blog = (0, mongoose_1.model)('blog', schema);
exports.default = Blog;
//# sourceMappingURL=blog.model.js.map