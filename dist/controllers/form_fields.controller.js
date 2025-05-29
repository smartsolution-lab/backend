"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteField = exports.getAll = exports.postFormFiled = void 0;
const form_field_model_1 = __importDefault(require("../models/form_field.model"));
// create FormField Code
const postFormFiled = async (req, res, next) => {
    try {
        if (!!req?.body?._id) {
            await form_field_model_1.default.findByIdAndUpdate(req?.body?._id, { ...req?.body });
            return res.status(200).json({
                error: false,
                msg: "updated successful",
            });
        }
        let { input_name, input_type, placeholder, field_required, status, step_name, select_options, link } = req.body;
        const field_name = input_name;
        input_name = input_name?.trim()?.split(' ')?.join('_');
        const insertData = {
            field_name,
            input_name,
            input_type,
            placeholder,
            field_required,
            status,
            step_name,
            select_options,
            link
        };
        delete req?.body?._id;
        const newFormField = await form_field_model_1.default.create(insertData);
        if (!newFormField)
            return res.status(400).json({ msg: 'Wrong input! try again..', error: true });
        return res.status(200).json({
            error: false,
            msg: "Created successfully",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: true,
            msg: "Server failed"
        });
    }
};
exports.postFormFiled = postFormFiled;
const getAll = async (req, res, next) => {
    try {
        const fields = await form_field_model_1.default.find({});
        return res.status(200).json({
            error: false,
            data: fields
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        });
    }
};
exports.getAll = getAll;
const deleteField = async (req, res, next) => {
    try {
        const { query } = req;
        await form_field_model_1.default.findByIdAndDelete(query?._id);
        return res.status(200).json({
            error: false,
            msg: "Delete success"
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        });
    }
};
exports.deleteField = deleteField;
//# sourceMappingURL=form_fields.controller.js.map