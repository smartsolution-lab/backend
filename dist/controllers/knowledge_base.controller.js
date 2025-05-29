"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKnowledge_base = exports.postKnowledge_base = void 0;
const knowledgebase_model_1 = __importDefault(require("../models/knowledgebase.model"));
function omit(key, obj) {
    const { [key]: omitted, ...rest } = obj;
    return rest;
}
const postKnowledge_base = async (req, res) => {
    const { body } = req;
    try {
        if (req.body._id === '') {
            omit('_id', body);
            await knowledgebase_model_1.default.create(body);
            return res.status(200).send({
                error: false,
                msg: "Successfully Created"
            });
        }
        else {
            await knowledgebase_model_1.default.findByIdAndUpdate({ _id: body._id }, body);
            return res.status(200).send({
                error: false,
                msg: "data Updated"
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({
            error: true,
            msg: "server error"
        });
    }
};
exports.postKnowledge_base = postKnowledge_base;
const getKnowledge_base = async (req, res) => {
    console.log("here...");
    const { query } = req;
    if (!!query._id) {
        const data = await knowledgebase_model_1.default.findById(query._id);
        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: data
        });
    }
    else {
        try {
            const data = await knowledgebase_model_1.default.find();
            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: data
            });
        }
        catch (err) {
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            });
        }
    }
};
exports.getKnowledge_base = getKnowledge_base;
//# sourceMappingURL=knowledge_base.controller.js.map