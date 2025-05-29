import UserFormField from '../models/user_form_field.model'
import FormField from '../models/form_field.model';
import mongoose from 'mongoose';


// create UserFormField
export const createUserFormField = async (req, res, next) => {
    try {
        const userFormField = await UserFormField.create(req.body);

        if (!userFormField) return res.status(400).json({msg: 'Wrong input! try again..', error: true});

        return res.status(200).json({
            error: false,
            msg: "New field created successfully",
            data: userFormField
        })

    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}

// get UserFormField by user_name
export const getOneUserFormField = async (req, res, next) => {
    try {
        const {query} = req;
        let match: any;
        if (query.id) {
            match = {service_vehicle: new mongoose.Types.ObjectId(query.id)}
        }

        // @ts-ignore
        const userFormField = await UserFormField.aggregatePaginate(UserFormField.aggregate(
                [
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
                    {$unwind: {path: '$vehicle', preserveNullAndEmptyArrays: true}},
                    {
                        $project: {
                            "data": {
                                $concatArrays: ["$step_one", "$step_two"]
                            }
                        }
                    },
                    {$unwind: {path: '$data', preserveNullAndEmptyArrays: true}},
                ]),
            {
                page: query.page || 1,
                limit: query.size || 10,
                sort: {"data.createdAt": 1},
            }
        );

        if (!userFormField?.docs) return res.status(404).json({msg: 'UserFormField Not found', error: true});

        res.status(200).json({
            error: false,
            data: userFormField
        })

    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        })
    }
};

// get all UserFormField
export const getAllUserFormField = async (req, res, next) => {
    try {
        const {query} = req;
        const {body} = req;
        // @ts-ignore
        const userFormFields = await UserFormField.paginate({
            $or: [
                {user_name: {$regex: new RegExp(query.searchValue, "i")}},
            ]
        }, {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: 1},
        })

        if (userFormFields?.docs?.length == 0) return res.status(404).json({
            msg: 'User_form_controllers not found',
            error: true
        });

        res.status(200).json({
            error: false,
            data: userFormFields
        })

    } catch (err) {
        res.status(500).json({
            error: true,
            msg: err.message
        })
    }
};

// delete UserFormField
export const deleteUserFormField = async (req, res, next) => {
    try {
        const {id, step_name, vehicleId} = req.query;
        let delUserFormFields;

        if (step_name === 'step_one') {
            delUserFormFields = await UserFormField.updateMany(
                {service_vehicle: new mongoose.Types.ObjectId(vehicleId)},
                {$pull: {step_one: {_id: new mongoose.Types.ObjectId(id)}}},
            );

        } else if (step_name === 'step_two') {
            delUserFormFields = await UserFormField.updateMany(
                {service_vehicle: new mongoose.Types.ObjectId(vehicleId)},
                {$pull: {step_two: {_id: new mongoose.Types.ObjectId(id)}}},
            );
        }

        if (!delUserFormFields) return res.status(404).json({msg: 'Not found', error: true});

        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        })

    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}

// update UserFormField
export const updateUserFormField = async (req, res, next) => {
    try {
        const {step, status, id, vehicleId} = req.body;
        let updateUserFormField;

        if (step === 'step_one') {
            updateUserFormField = await UserFormField.updateOne(
                {
                    step_one: {$elemMatch: {_id: new mongoose.Types.ObjectId(id)}},
                    service_vehicle: new mongoose.Types.ObjectId(vehicleId)
                },
                {$set: {"step_one.$.status": status}},
                {validateBeforeSave: false}
            )

        } else if (step === 'step_two') {
            updateUserFormField = await UserFormField.updateOne(
                {
                    step_two: {$elemMatch: {_id: new mongoose.Types.ObjectId(id)}},
                    service_vehicle: new mongoose.Types.ObjectId(vehicleId)
                },
                {$set: {"step_two.$.status": status}},
                {validateBeforeSave: false}
            )
        }

        if (!updateUserFormField) return res.status(400).json({message: 'Wrong input! try again..', status: false});

        return res.status(200).json({
            error: false,
            msg: "Updated successfully!",
            data: updateUserFormField
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}

// get all User Role except admin
export const getAllUserFormFieldExceptAdmin = async (req, res, next) => {
    try {
        const {query} = req;
        const {body} = req;
        // @ts-ignore
        const getAllUser_form_controller = await UserFormField.paginate({
            $or: [
                {name: {$regex: new RegExp(query.searchValue, "i")}},
                {display_name: {$regex: new RegExp(query.searchValue, "i")}},
            ]
        }, {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: 1},
        })

        if (getAllUser_form_controller?.docs?.length == 0) return res.status(404).json({
            message: 'User_form_controllers not found',
            status: false
        });

        const getRoles = getAllUser_form_controller?.docs?.filter(dt => dt?.name !== 'admin');

        return res.status(200).json({
            status: true,
            error: false,
            data: getRoles
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })
    }
};

// get specific user-role information
export const getSpecificUserRoleFormData = async (req, res, next) => {
    try {
        const {query} = req;
        const {vehicleId} = req.query;

        const formFields = await UserFormField.aggregate([
            {
                $match: {service_vehicle: new mongoose.Types.ObjectId(vehicleId)},
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
        ])

        return res.status(200).json({
            error: false,
            data: formFields[0]
        })

    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}