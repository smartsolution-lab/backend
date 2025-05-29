"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeGetByIdOrKey = exports.newEmployeeCreate = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user.model"));
const common_1 = require("../utils/common");
const secret = process.env.JWT_SECRET;
// post employee
const newEmployeeCreate = async (req, res, next) => {
    try {
        let { body } = req;
        console.log("🚀 ~ file: employee.controller.ts:21 ~ newEmployeeCreate ~ body", body);
        if (body._id) {
            let email = undefined;
            if (body.email) {
                email = await body.email?.toLowerCase();
            }
            await user_model_1.default.findByIdAndUpdate(body._id, {
                $set: {
                    first_name: body.first_name,
                    middle_name: body.middle_name,
                    last_name: body.last_name,
                    key: body.key,
                    access: body.access,
                    company_id: body.company_id,
                    email,
                    status: body.status,
                    phone: body.phone,
                    roles: body.designation,
                    department: body.department,
                    joining_date: body.joining_date,
                }
            }, { validateBeforeSave: false });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            const userExist = await user_model_1.default.findOne({ $or: [{ 'email': body.email }, { 'phone': body.phone }] });
            if (userExist)
                return res.status(400).json({ error: true, msg: "An account with this credential has already existed" });
            const randomNumberGen = await (0, common_1.numberGen)(6);
            let user = new user_model_1.default({
                first_name: body.first_name,
                middle_name: body.middle_name,
                last_name: body.last_name,
                username: body.username,
                email: body.email?.toLowerCase(),
                phone: body.phone,
                roles: body.designation,
                joining_date: body.joining_date || Date.now(),
                department: body.department,
                status: 'active',
                key: randomNumberGen,
                access: body.access,
                company_id: body.company_id,
                password: bcrypt_1.default.hashSync(body.password, 8),
            });
            await user.save();
            return res.status(200).send({
                error: false,
                msg: 'Successfully registered',
            });
        }
    }
    catch (e) {
        console.log(e);
        if (e?.code === 11000) {
            return res.status(406).send({
                error: true,
                msg: 'An account with this credential has already existed',
            });
        }
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.newEmployeeCreate = newEmployeeCreate;
// get employee by id
const employeeGetByIdOrKey = async (req, res, next) => {
    try {
        const { query } = req;
        const getUser = await user_model_1.default.aggregate([
            {
                $match: {
                    $or: [
                        { key: query.key },
                        { _id: new mongoose_1.default.Types.ObjectId(query._id) },
                    ]
                }
            },
            { $unwind: '$roles' },
            {
                $lookup: {
                    from: 'roles',
                    localField: "roles",
                    foreignField: '_id',
                    as: 'roles'
                }
            },
            { $unwind: { path: '$roles', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: "company_id",
                    foreignField: '_id',
                    as: 'company_id'
                }
            },
            { $unwind: { path: '$company_id', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: { $concat: [{ $ifNull: [{ $concat: ["$first_name", " "] }, ''] }, { $ifNull: [{ $concat: ["$middle_name", " "] }, ''] }, { $ifNull: ["$last_name", ''] }] },
                    company_id: "$company_id._id",
                    company_name: "$company_id.name",
                    email: 1,
                    role: "$roles.name",
                    phone: 1,
                    key: 1,
                    access: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);
        if (!getUser[0]?._id)
            return res.status(404).json({ error: true, msg: "Does not exists any employee with the specified identificator" });
        return res.status(200).json({
            error: false,
            data: getUser[0]
        });
    }
    catch (error) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.employeeGetByIdOrKey = employeeGetByIdOrKey;
//# sourceMappingURL=employee.controller.js.map