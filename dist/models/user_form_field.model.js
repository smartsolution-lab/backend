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
    service_vehicle: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'service_vehicle',
        required: true,
    },
    step_one: [
        {
            _id: mongoose_1.Schema.Types.ObjectId,
            field_name: {
                type: String,
                trim: true,
            },
            input_name: {
                type: String,
                trim: true,
                minlength: 0,
                maxlength: 300,
                lowercase: true,
                required: [true, 'Form field name required']
            },
            input_type: {
                type: String,
                enum: ['file', 'boolean', 'text', 'number', 'textarea', 'image', 'date', 'time', 'select', 'radio_button', 'switch', 'digital_signature', 'checkbox'],
                trim: true,
                minlength: 0,
                maxlength: 300,
                lowercase: true,
                required: [true, 'Form field type required']
            },
            select_options: [
                {
                    type: String,
                }
            ],
            link: {
                type: String,
                trim: true,
            },
            placeholder: {
                type: String,
                trim: true,
                minlength: 0,
                maxlength: 200,
            },
            field_required: {
                type: Boolean,
                default: false
            },
            status: {
                type: Boolean,
                required: [true, 'Form field status required']
            },
            step_name: {
                type: String,
                trim: true,
            },
            createdAt: Date,
            updatedAt: Date,
            __v: Number
        }
    ],
    step_two: [
        {
            _id: mongoose_1.Schema.Types.ObjectId,
            field_name: {
                type: String,
                trim: true,
            },
            input_name: {
                type: String,
                trim: true,
                minlength: 0,
                maxlength: 300,
                lowercase: true,
                required: [true, 'Form field name required']
            },
            input_type: {
                type: String,
                enum: ['file', 'boolean', 'text', 'number', 'textarea', 'image', 'date', 'time', 'select', 'radio_button', 'switch', 'digital_signature', 'checkbox'],
                trim: true,
                minlength: 0,
                maxlength: 300,
                lowercase: true,
                required: [true, 'Form field type required']
            },
            select_options: [
                {
                    type: String,
                }
            ],
            link: {
                type: String,
                trim: true,
            },
            placeholder: {
                type: String,
                trim: true,
                minlength: 0,
                maxlength: 200,
            },
            field_required: {
                type: Boolean,
                default: false
            },
            status: {
                type: Boolean,
                required: [true, 'Form field status required']
            },
            step_name: {
                type: String,
                trim: true,
            },
            createdAt: Date,
            updatedAt: Date,
            __v: Number
        }
    ],
    step_three: []
}, {
    timestamps: true
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
const UserFormField = (0, mongoose_1.model)("user_form_field", schema);
exports.default = UserFormField;
//# sourceMappingURL=user_form_field.model.js.map