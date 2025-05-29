import moment from 'moment';
import mongoose from 'mongoose';
import Attendance from '../models/attendance.model';

// get Attendance
export const getTimeSheet = async (req, res, next) => {
    try {
        const { query } = req;

        const attendance = await Attendance.aggregate([
            {
                $match: {
                    $and: [
                        { date: { $gte: moment(query.from).toDate() } },
                        { date: { $lte: moment(query.to).toDate() } },
                    ]
                }
            },
            {
                $lookup: {
                   from: "restaurants",
                   localField: "restaurant_id",
                   foreignField: "_id",
                   as: "restaurant",

                }
            },
            { $unwind: { path: "$restaurant", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                   from: "users",
                   localField: "employee_key",
                   foreignField: "key",
                   as: "employee",
                }
            },
            { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    restaurant_id: "$restaurant._id",
                    manager_id: "$manager._id",
                    employee_id: "$employee._id",
                    is_in: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$status", "out"] }, then: 0
                                },
                                {
                                    case: { $eq: ["$status", "in"] }, then: 1
                                },
                            ],
                            default: 0
                        },
                    },
                    punch_in: "$start_time",
                    punch_out: "$end_time",
                    working_time: { $dateDiff: { startDate: "$start_time", endDate: "$end_time", unit: "second" } },
                    created_at: "$createdAt",
                    updated_at: "$updatedAt",
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    employee: {
                        id: "$employee._id",
                        first_name: "$employee.first_name",
                        last_name: "$employee.last_name",
                        email: "$employee.email",
                        phone: "$employee.phone",
                        name: "$employee.name",
                    },

                }
            },

            { $sort: { createdAt: -1 } }
        ])

        return res.status(200).json({
            error: false,
            total: attendance?.length,
            data: attendance
        })


    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: err.message
        })
    }
}
