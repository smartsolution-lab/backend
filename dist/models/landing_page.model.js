"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
let schema = new mongoose_1.Schema({
    hero: {
        title: String,
        description: String,
        image: String
    },
    hero_section_banners: [],
    work: {
        work_title: String,
        work_description: String,
        work_card: [
            {
                icon: String,
                heading: String,
                paragraph: String,
                focus: Boolean
            }
        ]
    },
    statistics: {
        description_1st: String,
        data_1st: String,
        data_2nd: String,
        data_3rd: String,
        data_4th: String,
        description_2nd: String,
        description_3rd: String,
        description_4th: String,
    },
    benifit: {
        image1: String,
        middle_card_titile: String,
        middle_card_description: String,
        image2: String,
        left_card_titile: String,
        left_card_description: String,
        image3: String,
        right_card_titile: String,
        right_card_description: String,
    },
}, { timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const LandingPage = (0, mongoose_1.model)('landing_page', schema);
exports.default = LandingPage;
//# sourceMappingURL=landing_page.model.js.map