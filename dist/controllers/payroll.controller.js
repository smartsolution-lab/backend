"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delEmployeeSalary = exports.getSalaryList = exports.postSalary = exports.delPayrollAdvanceSalary = exports.getPayrollAdvanceSalaries = exports.postPayrollAdvanceSalary = exports.delPayrollSalarySetting = exports.getSalaryElements = exports.getPayrollSalarySettings = exports.postPayrollSalarySetting = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const payroll_salary_setting_model_1 = __importDefault(require("../models/payroll_salary_setting.model"));
const payroll_advance_salary_model_1 = __importDefault(require("../models/payroll_advance_salary.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const payroll_employee_salary_1 = __importDefault(require("../models/payroll_employee_salary"));
// post PayrollSalarySetting
const postPayrollSalarySetting = async (req, res, next) => {
    try {
        const { body } = req;
        console.log(body);
        if (!!body._id) {
            await payroll_salary_setting_model_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            delete body._id;
            await payroll_salary_setting_model_1.default.create({
                ...body
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postPayrollSalarySetting = postPayrollSalarySetting;
// get PayrollSalarySetting
const getPayrollSalarySettings = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        // @ts-ignore
        let data = await payroll_salary_setting_model_1.default.aggregatePaginate(payroll_salary_setting_model_1.default.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
                    }
                }
            ] : []),
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            { title: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: !!query._id ? data[0] : data
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getPayrollSalarySettings = getPayrollSalarySettings;
// get employees
const getSalaryElements = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        // @ts-ignore
        let data = await user_model_1.default.aggregatePaginate(user_model_1.default.aggregate([
            {
                $match: {
                    role: 'employee',
                }
            },
            {
                $lookup: {
                    from: 'payroll_employee_salaries',
                    let: { "employee_id": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$employee_id", "$$employee_id"]
                                }
                            }
                        },
                    ],
                    as: 'salary'
                }
            },
            { $unwind: { path: '$salary', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1,
                    email: 1,
                    phone: 1,
                    createdAt: 1,
                    alreadyAdded: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$_id", "$salary.employee_id"] }, then: true
                                },
                            ],
                            default: false
                        },
                    }
                }
            },
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                            { email: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                            { phone: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: data?.docs
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getSalaryElements = getSalaryElements;
// delete PayrollSalarySetting
const delPayrollSalarySetting = async (req, res, next) => {
    try {
        const { query } = req;
        await payroll_salary_setting_model_1.default.findByIdAndDelete(query._id);
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
exports.delPayrollSalarySetting = delPayrollSalarySetting;
/**
 *  Advance Salary
 * **/
const postPayrollAdvanceSalary = async (req, res, next) => {
    try {
        const { body } = req;
        if (!!body._id) {
            await payroll_advance_salary_model_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            delete body._id;
            await payroll_advance_salary_model_1.default.create({
                ...body
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postPayrollAdvanceSalary = postPayrollAdvanceSalary;
// get PayrollAdvanceSalary
const getPayrollAdvanceSalaries = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        // @ts-ignore
        let data = await payroll_advance_salary_model_1.default.aggregatePaginate(payroll_advance_salary_model_1.default.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
                    }
                }
            ] : []),
            {
                $lookup: {
                    from: 'departments',
                    let: { 'department': '$department' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$department'] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1
                            }
                        }
                    ],
                    as: 'department'
                }
            },
            { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'roles',
                    let: { 'role': '$designation' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$role'] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1
                            }
                        }
                    ],
                    as: 'designation'
                }
            },
            { $unwind: { path: '$designation', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    let: { 'employee': '$employee' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$employee'] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1
                            }
                        }
                    ],
                    as: 'employee'
                }
            },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            { title: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: !!query._id ? data[0] : data
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getPayrollAdvanceSalaries = getPayrollAdvanceSalaries;
// delete PayrollAdvanceSalary
const delPayrollAdvanceSalary = async (req, res, next) => {
    try {
        const { query } = req;
        await payroll_advance_salary_model_1.default.findByIdAndDelete(query._id);
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
exports.delPayrollAdvanceSalary = delPayrollAdvanceSalary;
/*
* employee salary
**/
const postSalary = async (req, res, next) => {
    try {
        const { body } = req;
        if (!!body._id) {
            await payroll_employee_salary_1.default.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            delete body._id;
            await payroll_employee_salary_1.default.create({
                ...body
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postSalary = postSalary;
const getSalaryList = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        // @ts-ignore
        let data = await payroll_employee_salary_1.default.aggregatePaginate(payroll_employee_salary_1.default.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
                    }
                }
            ] : []),
            {
                $lookup: {
                    from: 'users',
                    let: { 'employee': '$employee_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$employee'] }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                phone: 1,
                            }
                        }
                    ],
                    as: 'employee'
                }
            },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            { "employee.name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                            { "employee.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                            { "employee.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                            { net_salary: query.search },
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        return res.status(200).json({
            error: false,
            data: !!query._id ? data[0] : data
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getSalaryList = getSalaryList;
const delEmployeeSalary = async (req, res, next) => {
    try {
        const { query } = req;
        await payroll_employee_salary_1.default.findByIdAndDelete(query._id);
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
exports.delEmployeeSalary = delEmployeeSalary;
//# sourceMappingURL=payroll.controller.js.map