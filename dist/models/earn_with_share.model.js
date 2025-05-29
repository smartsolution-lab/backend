"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
let schema = new mongoose_1.Schema({
    section_1: {
        title: String,
        description: String,
    },
    section_3: {
        title: String,
        description: String,
    },
    required: [
        {
            title: String,
            description: String,
        }
    ],
}, { timestamps: true });
const EarnWithShare = (0, mongoose_1.model)('earn_with_share', schema);
exports.default = EarnWithShare;
//# sourceMappingURL=earn_with_share.model.js.map