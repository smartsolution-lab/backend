"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecificUserRoleFormData = exports.getAllUserFormFieldExceptAdmin = exports.updateUserFormField = exports.deleteUserFormField = exports.getAllUserFormField = exports.getOneUserFormField = exports.createUserFormField = void 0;
const user_form_field_model_1 = __importDefault(require("../models/user_form_field.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// create UserFormField
const createUserFormField = async (req, res, next) => {
    try {
        const userFormField = await user_form_field_model_1.default.create(req.body);
        if (!userFormField)
            return res.status(400).json({ msg: 'Wrong input! try again..', error: true });
        return res.status(200).json({
            error: false,
            msg: "New field created successfully",
            data: userFormField
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        });
    }
};
exports.createUserFormField = createUserFormField;
// get UserFormField by user_name
const getOneUserFormField = async (req, res, next) => {
    try {
        const { query } = req;
        let match;
        if (query.id) {
            match = { service_vehicle: new mongoose_1.default.Types.ObjectId(query.id) };
        }
        // @ts-ignore
        const userFormField = await user_form_field_model_1.default.aggregatePaginate(user_form_field_model_1.default.aggregate([
            {
                $match: match
            },
            {
                $lookup: {
                    from: "vehicles",
                    localField: "service_vehicle",
                    foreignField: "_id",
                    as: "vehicle"
                }
            },
            { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "data": {
                        $concatArrays: ["$step_one", "$step_two"]
                    }
                }
            },
            { $unwind: { path: '$data', preserveNullAndEmptyArrays: true } },
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { "data.createdAt": 1 },
        });
        if (!userFormField?.docs)
            return res.status(404).json({ msg: 'UserFormField Not found', error: true });
        res.status(200).json({
            error: false,
            data: userFormField
        });
    }
    catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
};
exports.getOneUserFormField = getOneUserFormField;
// get all UserFormField
const getAllUserFormField = async (req, res, next) => {
    try {
        const { query } = req;
        const { body } = req;
        // @ts-ignore
        const userFormFields = await user_form_field_model_1.default.paginate({
            $or: [
                { user_name: { $regex: new RegExp(query.searchValue, "i") } },
            ]
        }, {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: 1 },
        });
        if (userFormFields?.docs?.length == 0)
            return res.status(404).json({
                msg: 'User_form_controllers not found',
                error: true
            });
        res.status(200).json({
            error: false,
            data: userFormFields
        });
    }
    catch (err) {
        res.status(500).json({
            error: true,
            msg: err.message
        });
    }
};
exports.getAllUserFormField = getAllUserFormField;
// delete UserFormField
const deleteUserFormField = async (req, res, next) => {
    try {
        const { id, step_name, vehicleId } = req.query;
        let delUserFormFields;
        if (step_name === 'step_one') {
            delUserFormFields = await user_form_field_model_1.default.updateMany({ service_vehicle: new mongoose_1.default.Types.ObjectId(vehicleId) }, { $pull: { step_one: { _id: new mongoose_1.default.Types.ObjectId(id) } } });
        }
        else if (step_name === 'step_two') {
            delUserFormFields = await user_form_field_model_1.default.updateMany({ service_vehicle: new mongoose_1.default.Types.ObjectId(vehicleId) }, { $pull: { step_two: { _id: new mongoose_1.default.Types.ObjectId(id) } } });
        }
        if (!delUserFormFields)
            return res.status(404).json({ msg: 'Not found', error: true });
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        });
    }
};
exports.deleteUserFormField = deleteUserFormField;
// update UserFormField
const updateUserFormField = async (req, res, next) => {
    try {
        const { step, status, id, vehicleId } = req.body;
        let updateUserFormField;
        if (step === 'step_one') {
            updateUserFormField = await user_form_field_model_1.default.updateOne({
                step_one: { $elemMatch: { _id: new mongoose_1.default.Types.ObjectId(id) } },
                service_vehicle: new mongoose_1.default.Types.ObjectId(vehicleId)
            }, { $set: { "step_one.$.status": status } }, { validateBeforeSave: false });
        }
        else if (step === 'step_two') {
            updateUserFormField = await user_form_field_model_1.default.updateOne({
                step_two: { $elemMatch: { _id: new mongoose_1.default.Types.ObjectId(id) } },
                service_vehicle: new mongoose_1.default.Types.ObjectId(vehicleId)
            }, { $set: { "step_two.$.status": status } }, { validateBeforeSave: false });
        }
        if (!updateUserFormField)
            return res.status(400).json({ message: 'Wrong input! try again..', status: false });
        return res.status(200).json({
            error: false,
            msg: "Updated successfully!",
            data: updateUserFormField
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.updateUserFormField = updateUserFormField;
// get all User Role except admin
const getAllUserFormFieldExceptAdmin = async (req, res, next) => {
    try {
        const { query } = req;
        const { body } = req;
        // @ts-ignore
        const getAllUser_form_controller = await user_form_field_model_1.default.paginate({
            $or: [
                { name: { $regex: new RegExp(query.searchValue, "i") } },
                { display_name: { $regex: new RegExp(query.searchValue, "i") } },
            ]
        }, {
            page: query.page || 1,
            limit: query.size || 10,
            sort: { createdAt: 1 },
        });
        if (getAllUser_form_controller?.docs?.length == 0)
            return res.status(404).json({
                message: 'User_form_controllers not found',
                status: false
            });
        const getRoles = getAllUser_form_controller?.docs?.filter(dt => dt?.name !== 'admin');
        return res.status(200).json({
            status: true,
            error: false,
            data: getRoles
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
exports.getAllUserFormFieldExceptAdmin = getAllUserFormFieldExceptAdmin;
// get specific user-role information
const getSpecificUserRoleFormData = async (req, res, next) => {
    try {
        const { query } = req;
        const { vehicleId } = req.query;
        const formFields = await user_form_field_model_1.default.aggregate([
            {
                $match: { service_vehicle: new mongoose_1.default.Types.ObjectId(vehicleId) },
            },
            {
                $lookup: {
                    from: "service_vehicles",
                    localField: "service_vehicle",
                    foreignField: "_id",
                    as: "vehicle"
                }
            },
            {
                $unwind: '$vehicle'
            }
        ]);
        return res.status(200).json({
            error: false,
            data: formFields[0]
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        });
    }
};
exports.getSpecificUserRoleFormData = getSpecificUserRoleFormData;
//# sourceMappingURL=user_form_fields.controller.js.map