"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postPermissions = exports.deleteRole = exports.getRole = exports.departmentWiseList = exports.getRoles = exports.postRole = exports.getPermissions = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const role_model_1 = __importDefault(require("../models/role.model"));
const permission_1 = __importDefault(require("../utils/permission"));
const auth_1 = require("../auth");
const mongoose_1 = __importDefault(require("mongoose"));
// get all permissions
const getPermissions = async (req, res) => {
    res.status(200).send({
        error: false,
        msg: 'Successfully gets permissions',
        data: permission_1.default
    });
};
exports.getPermissions = getPermissions;
// new Role entry
const postRole = async (req, res, next) => {
    try {
        const { body } = req;
        if (body?._id) {
            await role_model_1.default.updateOne({ _id: body?._id }, { $set: body });
            return res.status(200).send({
                error: false,
                msg: 'Updated successful',
            });
        }
        delete body._id;
        const roleCreate = await role_model_1.default.create({ ...body });
        return res.status(200).send({
            error: false,
            msg: 'New role added successfully',
            data: roleCreate
        });
    }
    catch (e) {
        if (e?.code === 11000) {
            return res.status(406).send({
                error: true,
                msg: 'Role already exists',
            });
        }
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postRole = postRole;
// get all Role
const getRoles = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { "department.name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const getRoles = await role_model_1.default.aggregatePaginate(role_model_1.default.aggregate([
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: "$department" },
            { $match: filter }
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        if (getRoles?.docs?.length === 0)
            return res.status(404).json({ error: true, msg: "Role not found" });
        return res.status(200).send({
            error: false,
            data: getRoles
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getRoles = getRoles;
// department Or Categories Wise
const departmentWiseList = async (req, res, next) => {
    try {
        const { query } = req;
        // @ts-ignore
        const getRoles = await role_model_1.default.aggregatePaginate(role_model_1.default.aggregate([
            {
                $match: {
                    department: new mongoose_1.default.Types.ObjectId(query.department)
                }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: "$department" },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: -1 },
        });
        if (getRoles?.length === 0)
            return res.status(404).json({ error: true, msg: "Role not found" });
        return res.status(200).send({
            error: false,
            data: getRoles
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.departmentWiseList = departmentWiseList;
// get one Role
const getRole = async (req, res, next) => {
    try {
        const getRole = await role_model_1.default.findOne({ _id: req.query._id }).populate('department');
        if (!getRole)
            return res.status(404).json({ error: true, msg: "Role not found" });
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
exports.getRole = getRole;
// delete one Role
const deleteRole = async (req, res, next) => {
    try {
        const { query } = req;
        await role_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).send({
            error: false,
            msg: 'Successfully deleted role',
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.deleteRole = deleteRole;
const postPermissions = async (req, res) => {
    try {
        const { body } = req;
        const { user } = res.locals;
        let userCheck = await user_model_1.default.findById(user._id, 'permission role').populate('permission', ['permissions']);
        let admin = userCheck?.role === 'admin';
        if (!admin) {
            for (let p of body.permissions) {
                if (!(0, auth_1.havePermission)(p, user?.permission)) {
                    return res.status(401).send({
                        error: true,
                        msg: 'Unauthorized permissions found'
                    });
                }
            }
        }
        await role_model_1.default.findByIdAndUpdate(body.role, { permissions: body.permissions });
        res.status(200).send({
            error: false,
            msg: 'Successfully updated permissions',
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postPermissions = postPermissions;
//# sourceMappingURL=role.controller.js.map