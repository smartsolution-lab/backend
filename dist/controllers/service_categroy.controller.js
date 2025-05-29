"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryHeading = exports.postCategoryHeading = exports.delCategoryInfo = exports.getCategoryInfo = exports.postCategoryInfo = exports.delServiceCategory = exports.fetchAllServicesInDetails = exports.getServiceCategoryElements = exports.fetchServiceCategoriesForApp = exports.fetchServiceCategories = exports.fetchServiceCategory = exports.postServiceCategory = void 0;
const service_category_model_1 = __importDefault(require("../models/service_category.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const category_info_model_1 = __importDefault(require("../models/category_info.model"));
const postServiceCategory = async (req, res) => {
    try {
        let { body } = req;
        if (!!body._id) {
            await service_category_model_1.default.findOneAndUpdate({ _id: body._id }, body);
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated category'
            });
        }
        else {
            delete body._id;
            await service_category_model_1.default.create(body);
            return res.status(200).send({
                error: false,
                msg: 'Successfully added category'
            });
        }
    }
    catch (e) {
        if (e?.code === 11000) {
            return res.status(406).send({
                error: true,
                msg: 'Category name already exists',
            });
        }
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postServiceCategory = postServiceCategory;
const fetchServiceCategory = async (req, res, next) => {
    try {
        const { query } = req;
        const category = await service_category_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(query._id) });
        return res.status(200).json({
            error: false,
            data: category
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.fetchServiceCategory = fetchServiceCategory;
const fetchServiceCategories = async (req, res, next) => {
    try {
        const { query } = req;
        // @ts-ignore
        let data = await service_category_model_1.default.aggregatePaginate(service_category_model_1.default.aggregate([
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).send({
            error: false,
            msg: 'Successfully get categories',
            data
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.fetchServiceCategories = fetchServiceCategories;
const fetchServiceCategoriesForApp = async (req, res, next) => {
    try {
        const { query } = req;
        // @ts-ignore
        let data = await service_category_model_1.default.find();
        return res.status(200).send({
            error: false,
            msg: 'Successfully get categories',
            data: {
                categories: data
            }
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.fetchServiceCategoriesForApp = fetchServiceCategoriesForApp;
const getServiceCategoryElements = async (req, res) => {
    try {
        let { query } = req;
        let filter = { parent: { $exists: false } };
        if (query.parent) {
            filter.parent = new mongoose_1.default.Types.ObjectId(query.parent);
        }
        let data = await service_category_model_1.default.find(filter, 'name');
        return res.status(200).send({
            error: false,
            msg: 'Successfully get categories',
            data
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getServiceCategoryElements = getServiceCategoryElements;
const fetchAllServicesInDetails = async (req, res, next) => {
    try {
        const { query } = req;
        const vehicle = await service_category_model_1.default.aggregate([
            {
                $lookup: {
                    from: 'services',
                    let: { "category": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$$category", "$categories"]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                image: 1
                            }
                        }
                    ],
                    as: 'services'
                }
            },
            {
                $project: {
                    name: 1,
                    image: 1,
                    services: 1
                }
            }
        ]);
        return res.status(200).json({
            error: false,
            data: vehicle
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.fetchAllServicesInDetails = fetchAllServicesInDetails;
const delServiceCategory = async (req, res, next) => {
    try {
        const { query } = req;
        await service_category_model_1.default.findByIdAndDelete(query._id);
        await category_info_model_1.default.deleteMany({ service_category: new mongoose_1.default.Types.ObjectId(query._id) });
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
exports.delServiceCategory = delServiceCategory;
// category info
const postCategoryInfo = async (req, res, next) => {
    try {
        const { body } = req;
        if (!!body._id) {
            await category_info_model_1.default.updateOne({ service_category: body.service_category }, { $set: { ...body } });
            return res.status(200).send({
                error: false,
                msg: "Updated successfully"
            });
        }
        delete body._id;
        await category_info_model_1.default.create({
            ...body
        });
        return res.status(200).send({
            error: false,
            msg: "Information added"
        });
    }
    catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        });
    }
};
exports.postCategoryInfo = postCategoryInfo;
// CategoryInfo information
const getCategoryInfo = async (req, res, next) => {
    try {
        const { query } = req;
        const info = await category_info_model_1.default.aggregate([
            {
                $match: {
                    service_category: new mongoose_1.default.Types.ObjectId(query.service_category)
                }
            },
            {
                $project: {
                    brief_info: "$brief_info",
                    service_category: "$service_category",
                }
            }
        ]);
        return res.status(200).send({
            error: false,
            data: info[0]
        });
    }
    catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        });
    }
};
exports.getCategoryInfo = getCategoryInfo;
const delCategoryInfo = async (req, res, next) => {
    try {
        await category_info_model_1.default.findByIdAndDelete(req.query.id);
        return res.status(200).send({
            error: false,
            msg: "Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        });
    }
};
exports.delCategoryInfo = delCategoryInfo;
// heading info
const postCategoryHeading = async (req, res, next) => {
    try {
        const { body } = req;
        console.log(body);
        if (!!body._id) {
            await category_info_model_1.default.updateOne({ _id: body._id }, {
                $set: {
                    section_title: body.section_title,
                    section_sub_title: body.section_sub_title,
                }
            });
            return res.status(200).send({
                error: false,
                msg: "Updated successfully"
            });
        }
        delete body._id;
        await category_info_model_1.default.create({
            section_title: body.section_title,
            section_sub_title: body.section_sub_title,
            heading: true
        });
        return res.status(200).send({
            error: false,
            msg: "Information added"
        });
    }
    catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        });
    }
};
exports.postCategoryHeading = postCategoryHeading;
const getCategoryHeading = async (req, res, next) => {
    try {
        const { query } = req;
        const heading = await category_info_model_1.default.aggregate([
            {
                $match: {
                    heading: true
                }
            },
            {
                $project: {
                    section_title: 1,
                    section_sub_title: 1,
                }
            }
        ]);
        return res.status(200).send({
            error: false,
            data: heading[0]
        });
    }
    catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        });
    }
};
exports.getCategoryHeading = getCategoryHeading;
//# sourceMappingURL=service_categroy.controller.js.map