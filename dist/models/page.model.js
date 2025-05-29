"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    title: String,
    type: String,
    page: {
        type: String,
        unique: true,
        required: true,
    },
    content: [{
            type: {
                type: String,
            },
            key: String,
            value: String,
            lang: String,
        }]
}, { timestamps: true });
const Page = (0, mongoose_1.model)('page', schema);
exports.default = Page;
//# sourceMappingURL=page.model.js.map