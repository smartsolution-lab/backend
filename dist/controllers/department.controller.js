"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delDepartment = exports.getDepartmentElements = exports.getDepartmentWiseSubDepartmentList = exports.departmentList = exports.getDepartment = exports.postDepartment = void 0;
const department_model_1 = __importDefault(require("../models/department.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const postDepartment = async (req, res) => {
    try {
        let { body } = req;
        if (!!body._id) {
            await department_model_1.default.findOneAndUpdate({ _id: body._id }, body);
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated department'
            });
        }
        else {
            delete body._id;
            await department_model_1.default.create(body);
            return res.status(200).send({
                error: false,
                msg: 'Successfully added department'
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
exports.postDepartment = postDepartment;
const getDepartment = async (req, res, next) => {
    try {
        const { query } = req;
        const category = await department_model_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(query._id) });
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
exports.getDepartment = getDepartment;
const departmentList = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = { parent: { $exists: !!query.subcategory } };
        if (!!query.parent) {
            filter.parent = new mongoose_1.default.Types.ObjectId(query.parent);
        }
        // @ts-ignore
        let data = await department_model_1.default.aggregatePaginate(department_model_1.default.aggregate([
            { $match: filter },
            { $lookup: { from: 'departments', localField: '_id', foreignField: 'parent', as: 'child' } },
            { $lookup: { from: 'departments', localField: 'parent', foreignField: '_id', as: 'parent' } },
            { $unwind: { path: "$parent", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1,
                    description: 1,
                    image: 1,
                    parent: {
                        _id: 1,
                        name: 1,
                    },
                    createdAt: 1,
                    active: 1
                }
            },
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
            msg: 'Successfully get departments',
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
exports.departmentList = departmentList;
const getDepartmentWiseSubDepartmentList = async (req, res, next) => {
    try {
        const { query } = req;
        // @ts-ignore
        let data = await department_model_1.default.aggregatePaginate(department_model_1.default.aggregate([
            {
                $match: {
                    $and: [
                        { parent: { $exists: !!query.subcategory } },
                        { parent: new mongoose_1.default.Types.ObjectId(query.parent) }
                    ]
                }
            },
            { $lookup: { from: 'departments', localField: '_id', foreignField: 'parent', as: 'child' } },
            { $lookup: { from: 'departments', localField: 'parent', foreignField: '_id', as: 'parent' } },
            { $unwind: { path: "$parent", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1,
                    description: 1,
                    image: 1,
                    subcategories: { $size: "$child" },
                    parent: {
                        _id: 1,
                        name: 1,
                    },
                    createdAt: 1,
                }
            },
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                            { "parent.name": { $regex: new RegExp(query.search.toLowerCase(), "i") } }
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
            msg: 'Successfully get departments',
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
exports.getDepartmentWiseSubDepartmentList = getDepartmentWiseSubDepartmentList;
const getDepartmentElements = async (req, res) => {
    try {
        let { query } = req;
        let filter = { parent: { $exists: false } };
        if (query.parent) {
            filter.parent = new mongoose_1.default.Types.ObjectId(query.parent);
        }
        let data = await department_model_1.default.find(filter, 'name');
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
exports.getDepartmentElements = getDepartmentElements;
const delDepartment = async (req, res, next) => {
    try {
        const { query } = req;
        await department_model_1.default.findByIdAndDelete(query._id);
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
exports.delDepartment = delDepartment;
//# sourceMappingURL=department.controller.js.map