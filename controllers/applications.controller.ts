import mongoose from 'mongoose';
import Application from '../models/application.model';
import User from '../models/user.model';
// import Role from '../models/role.model';
import bcrypt from 'bcrypt'
import {sendUserEmailGeneral} from '../utils/userEmailSend';
import Settings from '../models/settings.model';
import {capitalizeFirstLetter} from '../utils/common';


export const createApplication = async (req, res, next) => {
    try {
        const application = await Application.create(req.body);

        if (!application) return res.status(400).json({error: true, msg: "Wrong input!"});

        return res.status(200).json({
            error: false,
            data: application,
            msg: "Personal Information received successfully"
        })


    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}


export const getOneApplication = async (req, res, next) => {
    try {
        const {query} = req;

        const application = await Application.findById(query._id).populate("user", "-password -roles").populate('vehicle');
        if (!application) return res.status(400).json({error: true, msg: "Wrong input!"});

        return res.status(200).json({
            error: false,
            data: application
        })

    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}


export const getAllApplication = async (req, res, next) => {
    try {
        const {query} = req;
        let match: any = {}
        // @ts-ignore
        const applications = await Application.aggregatePaginate(Application.aggregate([
            {$match: match},
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    pipeline: [
                        {$unwind: '$roles'},
                        {
                            $lookup: {
                                from: "roles",
                                localField: "roles",
                                foreignField: "_id",
                                as: 'roles'
                            }
                        },
                        {$unwind: '$roles'},
                    ],
                    as: 'user',
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "vehicles",
                    localField: "vehicle",
                    foreignField: "_id",
                    as: 'vehicle'
                }
            },
            {$unwind: {path: '$vehicle', preserveNullAndEmptyArrays: true}},
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        });


        if (applications?.length <= 0) return res.status(400).json({error: true, msg: "Wrong input!"});

        return res.status(200).json({
            error: false,
            total: applications?.length,
            data: applications
        })

    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}

// update register info
export const updateApplication = async (req, res, next) => {
    try {
        let application = await Application.findOne({_id: req.body.id});

        const updatedReg = application['registration'];

        const keyV = Object.keys(req.body);
        const valueV = Object.values(req.body)

        keyV.forEach((e, i) => {
            updatedReg[e] = valueV[i]
        })

        const applications = await Application.updateOne({_id: req.body.id}, {$set: {registration: updatedReg}});

        if (applications?.modifiedCount === 0) return res.status(400).json({error: true, msg: "Wrong input!"});

        return res.status(200).json({
            error: false,
            msg: 'Updated successful, we will touch you later.'
        });

    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}

// update one application status
export const updateApplicationStatus = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {body, query} = req;
        console.log(body)
        const {
            _id,
            vehicle,
            registration,
            user = null
        } = await Application.findByIdAndUpdate(body.id, {$set: {status: body.status}}, {session});
        if (!_id) return res.status(404).json({error: true, msg: "Status not updated"})

        if (body.status === 'active' && !user) {
            const userExist = await User.findOne({
                $or: [
                    {'email': registration?.email},
                    {'phone': registration?.mobile_number || registration?.mobile || registration?.phone || registration?.phone_number}
                ]
            })
            if (userExist) return res.status(400).json({
                error: true,
                msg: "An account with this credential has already existed"
            })

            // const riderRole = await Role.findOne({ $or: [{ name: 'driver' }, { name: 'rider' }] });
            const hashedPassword = await bcrypt.hash('123456', 8);
            const newRider = await User.create([{
                first_name: registration?.first_name,
                middle_name: registration?.middle_name,
                last_name: registration?.last_name,
                email: registration?.email?.toLowerCase(),
                phone: registration?.mobile_number || registration?.mobile || registration?.phone || registration?.phone_number,
                password: hashedPassword,
                // roles: riderRole?._id,
                role: 'driver',
                application: _id,
                status: 'active',
                vehicles: vehicle
            }], {session});

            if (!newRider) return res.status(400).send({
                error: true,
                msg: "Failed! Information Missing"
            })

            await Application.findByIdAndUpdate(_id, {$set: {user: newRider[0]?._id}}, {session});
            const envFileData = await Settings.findOne({});

            const firstName = newRider[0]?.first_name ?? '';
            const middleName = newRider[0]?.middle_name ?? "";
            const lastName = newRider[0]?.last_name ?? '';
            // @ts-ignore
            const websiteName = capitalizeFirstLetter(envFileData?.site_name);
            const emailData = {
                email: newRider[0]?.email,
                // @ts-ignore
                subject: `Welcome to ${envFileData?.site_name}`,
                message: `
                    Hello, ${firstName + " " + (middleName || '') + " " + lastName} ! <br/>
                    Welcome to our ${websiteName} family. <br/>
                    Your application has been approved. Please <a href=${
                    // @ts-ignore
                    envFileData?.url?.login || '#'
                }>verify</a> your account as soon as possible.
                    <div style="border-radius: 5px; background-color: rgba(0,0,0, .1); padding: 10px; margin: 30px 0px">
                        <h3 style="text-align: center;">Your login credentials</h3>
                        <p style="text-align: center;">Email / mobile number: ${newRider[0]?.phone || newRider[0]?.email}</p>
                        <p style="text-align: center;">Password: 123456</p>
                    </div>
                    <p style="color: red; text-size: 12px;">*Warning: Please change your password after first login<p/>
                `,
            }
            await sendUserEmailGeneral(emailData);

            await session.commitTransaction();
            return res.status(200).send({
                error: false,
                msg: "Updated successful and new rider created"
            })

        } else if (body.status === 'inactive' && !!user) {
            await User.updateOne({application: new mongoose.Types.ObjectId(_id)}, {status: 'inactive'}, {session})
            await session.commitTransaction();
            return res.status(200).send({
                error: false,
                msg: "Updated successful and rider inactivated"
            })
        } else if (body.status === 'active' && !!user) {
            await User.updateOne({application: new mongoose.Types.ObjectId(_id)}, {status: 'active'}, {session})
            await session.commitTransaction();
            return res.status(200).send({
                error: false,
                msg: "Updated successful"
            })
        }

        await session.commitTransaction();
        return res.status(200).send({
            error: false,
            msg: "Updated successful"
        })

    } catch (e) {
        await session.abortTransaction()
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    } finally {
        await session.endSession()
    }
}

// delete application 
export const deleteApplication = async (req, res, next) => {
    try {
        const {query} = req;

        const updateApplication = await Application.deleteOne({_id: query._id});

        if (updateApplication?.deletedCount === 0) return res.status(404).json({error: true, msg: 'Delete failed'});

        return res.status(200).json({
            error: false,
            msg: 'Deleted successful'
        })

    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}