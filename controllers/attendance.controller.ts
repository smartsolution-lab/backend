import User from '../models/user.model';
import moment from 'moment';
import mongoose from 'mongoose';
import Attendance from '../models/attendance.model';
import AttendanceSetting from '../models/attendance_setting.model';
import { employeeElement } from './user.controller';


// Attendance settings
// post AttendanceSetting
export const postAttendanceSetting = async (req, res, next) => {
    try {
        const { body } = req;
        if (body._id) {
            await AttendanceSetting.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });

        } else {
            await AttendanceSetting.create({
                start_work: body.start_work,
                end_work: body.end_work,
                start_break: body.start_break,
                end_break: body.end_break,
                weekends: body.weekends,
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            })
        }

    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({
                error: true,
                msg: 'Duplicate warning!'
            })
        }
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}


// get AttendanceSetting
export const getAttendanceSetting = async (req, res, next) => {
    try {
        const attendanceSetting = await AttendanceSetting.findOne();
        return res.status(200).json({
            error: false,
            data: attendanceSetting
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server error"
        })
    }
}


// delete AttendanceSetting
export const delAttendanceSetting = async (req, res, next) => {
    try {
        const { query } = req;

        await AttendanceSetting.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}


/**
 * Attendance 
 */
export const postAttendance = async (req, res, next) => {
    try {
        const { body } = req;
        if (body._id) {
            console.log(body)
            await Attendance.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: `${body?.status === 'out' ? "Clocked Out Successful" : 'Successfully updated'}`
            });

        } else {
            await Attendance.create({
                employee_key: body.employee_key,
                start_time: body.start_time,
                end_time: body.end_time,
                date: body.date,
                status: body.status,
                restaurant_id: body.restaurant_id
            });
            return res.status(200).json({
                error: false,
                msg: `${body?.status === 'in' ? "Clocked In successful" : 'Successfully created!'}`
            })
        }


    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({
                error: true,
                msg: 'Duplicate warning!'
            })
        }
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}

// get Attendance
export const getAttendance = async (req, res, next) => {
    try {
        const { query } = req;
        let filter: any = {};

        if (!!query.employee_key && !!query.end_time && !!query.start_time) {
            filter = {
                $and: [
                    { key: query.employee_key },
                    {
                        date: {
                            $gte: moment(query.start_time).toDate(),
                            $lte: moment(query.end_time).toDate(),
                        }
                    }
                ]
            }
        } else if (!!query.employee_key) {
            filter = {
                key: query.employee_key,
            }
        } else if (!!query.end_time && !!query.start_time) {
            filter = {

                date: {
                    $gte: moment(query.start_time).toDate(),
                    $lte: moment(query.end_time).toDate(),
                }

            }
        }

        // @ts-ignore
        const attendance = await Attendance.aggregatePaginate(Attendance.aggregate([
            // {
            //     $match: {
            //         restaurant_id: new mongoose.Types.ObjectId(query.restaurant)
            //     }
            // },
            {
                $lookup: {
                    from: 'users',
                    localField: 'employee_key',
                    foreignField: 'key',
                    as: 'employee_key'
                }
            },
            { $unwind: { path: '$employee_key', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    employee_id: "$employee_key._id",
                    employee: "$employee_key.name",
                    start_time: { $ifNull: ["$start_time", 0] },
                    end_time: { $ifNull: ["$end_time", 0] },
                    active_time: { $dateDiff: { startDate: "$start_time", endDate: "$end_time", unit: "second" } },
                    total_break_time: { $dateDiff: { startDate: "$break_time_start", endDate: "$break_time_end", unit: "second" } },
                    date: { $toDate: "$date" },
                    createdAt: 1,
                    key: "$employee_key.key"
                }
            },

            { $match: filter },
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            { employee: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                            { active_time: Number(query.search) },
                        ]
                    }
                }
            ] : [])

        ]), {
            page: query.page || 1,
            limit: query.size || 20,
            sort: { createdAt: -1 },
        })

        return res.status(200).json({
            error: false,
            data: attendance
        })

    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: "Server error"
        })
    }
}

// delete Attendance
export const delAttendance = async (req, res, next) => {
    try {
        const { query } = req;

        await Attendance.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}

// get Attendance
export const getEmployeePlusLastPunch = async (req, res, next) => {
    try {
        const { query } = req;
        let filter: any = {};
        let employeeRoles = await employeeElement();

        // @ts-ignore
        const attendance = await User.aggregatePaginate(User.aggregate([
            {
                $match: {
                    role: 'employee'
                }
            },
            {
                $lookup: {
                    from: 'attendances',
                    let: { "employee_key": "$key" },
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$employee_key", "$$employee_key"] } }
                        },
                        {
                            $group: {
                                _id: null, last: { $last: "$$ROOT" }
                            }
                        }

                    ],
                    as: 'attendances'
                }
            },
            { $unwind: { path: '$attendances', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    employee:  "$name",
                    start_time: { $ifNull: ["$attendances.last.start_time", 0] },
                    end_time: "$attendances.last.end_time",
                    attendance_id: { $ifNull: ["$attendances.last._id", undefined] },
                    active_time: { $dateDiff: { startDate: "$attendances.last.start_time", endDate: "$attendances.last.end_time", unit: "second" } },
                    date: "$attendances.last.date",
                    createdAt: 1,
                    key: 1,
                    status: "$attendances.last.status"
                }
            },

        ]), {
            page: query.page || 1,
            limit: query.size || 20,
            sort: { createdAt: -1 },
        })

        return res.status(200).json({
            error: false,
            data: attendance
        })

    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}

// employee find according to in out
export const getEmployeePunchInOut = async (req, res, next) => {
    try {
        const { query } = req;

        const punchIn = await Attendance.aggregate([
            {
                $match: { status: 'in' }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'employee_key',
                    foreignField: 'key',
                    as: 'employee'
                }
            },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: "$employee._id",
                    employee: "$employee.name",
                    start_time: { $ifNull: ["$start_time", 0] },
                    end_time: { $ifNull: ["$end_time", 0] },
                    attendance_id: { $ifNull: ["$_id", undefined] },
                    active_time: { $dateDiff: { startDate: "$start_time", endDate: "$end_time", unit: "minute" } },
                    date: "$date",
                    createdAt: 1,
                    status: "$status"
                }
            },
        ])

        let employeeRoles = await employeeElement();
        const attendance = await User.aggregate([
            {
                $match: {
                    role: 'employee'
                }
            },
            {
                $lookup: {
                    from: 'attendances',
                    let: { "employee_key": "$key" },
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$employee_key", "$$employee_key"] } }
                        },
                        {
                            $group: {
                                _id: null, createdAt: { $last: "$createdAt" }, start_time: { $last: "$start_time" }, end_time: { $last: "$end_time" }, date: { $last: "$date" }, updatedAt: { $last: "$updatedAt" }, attendance_id: { $last: "$_id" }, status: { $last: "$status" }
                            }
                        }
                    ],
                    as: 'employee'
                }
            },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    employee: "$name",
                    start_time: { $ifNull: ["$employee.start_time", 0] },
                    end_time: { $ifNull: ["$employee.end_time", 0] },
                    attendance_id: { $ifNull: ["$employee.attendance_id", undefined] },
                    active_time: { $dateDiff: { startDate: "$employee.start_time", endDate: "$employee.end_time", unit: "minute" } },
                    date: "$employee.date",
                    createdAt: 1,
                    key: 1,
                    status: "$employee.status"
                }
            },
            { $sort: { createdAt: -1 } }

        ])

        let punchOut = [];
        for (let j = 0; j < attendance?.length; j++) {
            if (attendance[j].status === 'in') {
                continue;
            }
            punchOut.push(attendance[j])
        }

        return res.status(200).json({
            error: false,
            data: {
                totalIn: punchIn?.length,
                totalOut: punchOut?.length,
                punchIn,
                punchOut,
            }
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}


/**
 * clock in-out
 */
export const clockIn = async (req, res, next) => {
    try {
        let totalBreakTime = [];
        const userExit = await User.findOne({ key: req.query.key });

        if (!userExit) {
            return res.status(404).json({
                error: true,
                msg: "User Not Found",
            })
        }

        const findLatest = await Attendance.findOne(
            { employee_key: req.query.key },
        ).sort({ createdAt: -1 });

        if (findLatest?.status === 'in') {
            return res.status(400).json({
                error: true,
                msg: "Already clocked in",
                data: {
                    name: userExit?.middle_name ? `${userExit?.first_name} ${userExit?.middle_name} ${userExit?.last_name}` : `${userExit?.first_name} ${userExit?.last_name}`
                }
            })
        }
        if (!!findLatest?.break_time_start) {
            await Attendance.updateOne(
                { _id: new mongoose.Types.ObjectId(findLatest?._id) },
                { break_time_end: moment().format() }
            );
            totalBreakTime = await Attendance.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(findLatest?._id) }
                },
                {
                    $project: {
                        break_time_end: 1,
                        break_time_start: 1,
                        total_break_time: { $dateDiff: { startDate: "$break_time_start", endDate: "$break_time_end", unit: "second" } }
                    }
                }
            ])
        }

        const attendance = await Attendance.create({
            employee_key: req.query.key,
            start_time: moment().format(),
            date: moment().format(),
            status: 'in'
        });

        return res.status(200).json({
            error: false,
            msg: "Clocked in successful",
            break_time_duration: totalBreakTime[0],
            data: {
                employee_key: attendance.employee_key,
                start_time: attendance.start_time,
                date: attendance.date,
                status: attendance.status,
                _id: attendance._id,
                // @ts-ignore
                createdAt: attendance.createdAt,
                // @ts-ignore
                updatedAt: attendance.updatedAt,
                name: userExit?.middle_name ? `${userExit?.first_name} ${userExit?.middle_name} ${userExit?.last_name}` : `${userExit?.first_name} ${userExit?.last_name}`
            },
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server error"
        })
    }
}

export const clockOut = async (req, res, next) => {
    try {
        const userExit = await User.findOne({ key: req.query.key });

        if (!userExit) {
            return res.status(404).json({
                error: true,
                msg: "User Not Found",
            })
        }

        const findLatest = await Attendance.findOne(
            { employee_key: req.query.key },
        ).sort({ createdAt: -1 });

        if (findLatest?.status === 'out') {
            return res.status(400).json({
                error: true,
                msg: "Already clocked out",
                data: {
                    name: userExit?.middle_name ? `${userExit?.first_name} ${userExit?.middle_name} ${userExit?.last_name}` : `${userExit?.first_name} ${userExit?.last_name}`
                }
            })
        }

        await Attendance.updateOne(
            { _id: new mongoose.Types.ObjectId(findLatest?._id) },
            { end_time: moment().format(), status: 'out' }
        );

        const attendanceData = await Attendance.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(findLatest?._id),
                }
            },
            {
                $project: {
                    employee_key: 1,
                    start_time: 1,
                    end_time: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    status: 1,
                    duration: { $dateDiff: { startDate: "$start_time", endDate: "$end_time", unit: "minute" } }
                }
            }
        ])

        return res.status(200).json({
            error: false,
            msg: "Clocked out successful",
            data: {
                ...attendanceData[0],
                name: userExit?.middle_name ? `${userExit?.first_name} ${userExit?.middle_name} ${userExit?.last_name}` : `${userExit?.first_name} ${userExit?.last_name}`
            }
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server error"
        })
    }
}


export const getOneClockInOut = async (req, res, next) => {
    try {
        const attendance = await Attendance.findOne(
            { employee_key: req.query.key },
        ).sort({ createdAt: -1 });

        return res.status(200).json({
            error: false,
            data: attendance
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server error"
        })
    }
}

// breakTime start
export const breakTimeStart = async (req, res, next) => {
    try {
        const { query } = req;
        const userExit = await User.findOne({ key: req.query.key });
        if (!userExit) {
            return res.status(404).json({
                error: true,
                msg: "User Not Found",
            })
        }

        const findLatest = await Attendance.findOne(
            { employee_key: req.query.key },
        ).sort({ createdAt: -1 });

        if (findLatest?.status === 'in') {
            await Attendance.updateOne(
                { _id: new mongoose.Types.ObjectId(findLatest?._id) },
                { end_time: moment(Date.now()).format(), status: 'out', break_time_start: moment(Date.now()).format() }
            );

            return res.status(200).json({
                error: false,
                msg: "Break time started",
                data: {
                    name: userExit?.middle_name ? `${userExit?.first_name} ${userExit?.middle_name} ${userExit?.last_name}` : `${userExit?.first_name} ${userExit?.last_name}`
                }
            })

        } else if (findLatest?.status === 'out') {
            return res.status(400).json({
                error: true,
                msg: "Please clock in first!",
                data: {
                    name: userExit?.middle_name ? `${userExit?.first_name} ${userExit?.middle_name} ${userExit?.last_name}` : `${userExit?.first_name} ${userExit?.last_name}`
                }
            });
        }

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server error"
        })
    }
}

