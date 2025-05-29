"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delBlog = exports.fetchBlog = exports.fetchBlogs = exports.postBlog = void 0;
const blog_model_1 = __importDefault(require("../models/blog.model"));
const postBlog = async (req, res) => {
    try {
        let { body } = req;
        if (!!body._id) {
            await blog_model_1.default.findOneAndUpdate({ _id: body._id }, body);
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated blog'
            });
        }
        else {
            delete body._id;
            await blog_model_1.default.create(body);
            return res.status(200).send({
                error: false,
                msg: 'Successfully created'
            });
        }
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postBlog = postBlog;
const fetchBlogs = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = { lang: query.lang, type: query.type };
        // @ts-ignore
        const data = await blog_model_1.default.aggregatePaginate(blog_model_1.default.aggregate([
            { $match: filter },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        if (data?.docs?.length === 0)
            return res.status(404).json({ error: true, msg: "data not found" });
        return res.status(200).send({
            error: false,
            data: data
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.fetchBlogs = fetchBlogs;
const fetchBlog = async (req, res, next) => {
    try {
        const getRole = await blog_model_1.default.findOne({ _id: req.query._id });
        if (!getRole)
            return res.status(404).json({ error: true, msg: "Blog not found" });
        return res.status(200).send({
            error: false,
            data: getRole
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.fetchBlog = fetchBlog;
const delBlog = async (req, res, next) => {
    try {
        const { query } = req;
        console.log("a......................");
        await blog_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.delBlog = delBlog;
//# sourceMappingURL=blog.controller.js.map