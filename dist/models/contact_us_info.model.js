"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
// schema design
const schema = new mongoose_1.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    message: {
        type: String,
    },
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const ContactUsInfo = (0, mongoose_1.model)("contact_us_info)", schema);
exports.default = ContactUsInfo;
//# sourceMappingURL=contact_us_info.model.js.map