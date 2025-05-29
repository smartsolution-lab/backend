import mongoose from 'mongoose';
import PayrollSalarySetting from "../models/payroll_salary_setting.model";
import PayrollAdvanceSalary from "../models/payroll_advance_salary.model";
import User from "../models/user.model";
import PayrollEmployeeSalary from "../models/payroll_employee_salary";


// post PayrollSalarySetting
export const postPayrollSalarySetting = async (req, res, next) => {
    try {
        const {body} = req;
        console.log(body)
        if (!!body._id) {
            await PayrollSalarySetting.findByIdAndUpdate(body._id, {$set: body});
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        } else {
            delete body._id
            await PayrollSalarySetting.create({
                ...body
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

// get PayrollSalarySetting
export const getPayrollSalarySettings = async (req, res, next) => {
    try {
        const {query} = req;
        let filter: any = {};
        // @ts-ignore
        let data = await PayrollSalarySetting.aggregatePaginate(PayrollSalarySetting.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                }
            ] : []),
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            {title: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        })
        return res.status(200).json({
            error: false,
            data: !!query._id ? data[0] : data
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

// get employees
export const getSalaryElements = async (req, res, next) => {
    try {
        const {query} = req;
        let filter: any = {};
        // @ts-ignore
        let data = await User.aggregatePaginate(User.aggregate([
            {
                $match: {
                    role: 'employee',
                }
            },
            {
                $lookup: {
                    from: 'payroll_employee_salaries',
                    let: {"employee_id": "$_id"},
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
            {$unwind: {path: '$salary', preserveNullAndEmptyArrays: true}},
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
                            {name: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                            {email: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                            {phone: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        })
        return res.status(200).json({
            error: false,
            data: data?.docs
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

// delete PayrollSalarySetting
export const delPayrollSalarySetting = async (req, res, next) => {
    try {
        const {query} = req;
        await PayrollSalarySetting.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

/**
 *  Advance Salary
 * **/
export const postPayrollAdvanceSalary = async (req, res, next) => {
    try {
        const {body} = req;
        if (!!body._id) {
            await PayrollAdvanceSalary.findByIdAndUpdate(body._id, {$set: body});
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        } else {
            delete body._id
            await PayrollAdvanceSalary.create({
                ...body
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

// get PayrollAdvanceSalary
export const getPayrollAdvanceSalaries = async (req, res, next) => {
    try {
        const {query} = req;
        let filter: any = {};
        // @ts-ignore
        let data = await PayrollAdvanceSalary.aggregatePaginate(PayrollAdvanceSalary.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                }
            ] : []),
            {
                $lookup: {
                    from: 'departments',
                    let: {'department': '$department'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ['$_id', '$$department']}
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
            {$unwind: {path: '$department', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'roles',
                    let: {'role': '$designation'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ['$_id', '$$role']}
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
            {$unwind: {path: '$designation', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'users',
                    let: {'employee': '$employee'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ['$_id', '$$employee']}
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
            {$unwind: {path: '$employee', preserveNullAndEmptyArrays: true}},
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            {title: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        })
        return res.status(200).json({
            error: false,
            data: !!query._id ? data[0] : data
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

// delete PayrollAdvanceSalary
export const delPayrollAdvanceSalary = async (req, res, next) => {
    try {
        const {query} = req;
        await PayrollAdvanceSalary.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}


/*
* employee salary
**/
export const postSalary = async (req, res, next) => {
    try {
        const {body} = req;
        if (!!body._id) {
            await PayrollEmployeeSalary.findByIdAndUpdate(body._id, {$set: body});
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        } else {
            delete body._id
            await PayrollEmployeeSalary.create({
                ...body
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const getSalaryList = async (req, res, next) => {
    try {
        const {query} = req;
        let filter: any = {};
        // @ts-ignore
        let data = await PayrollEmployeeSalary.aggregatePaginate(PayrollEmployeeSalary.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                }
            ] : []),
            {
                $lookup: {
                    from: 'users',
                    let: {'employee': '$employee_id'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ['$_id', '$$employee']}
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
            {$unwind: {path: '$employee', preserveNullAndEmptyArrays: true}},
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            {"employee.name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                            {"employee.email": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                            {"employee.phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                            {net_salary: query.search},
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        })
        return res.status(200).json({
            error: false,
            data: !!query._id ? data[0] : data
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const delEmployeeSalary = async (req, res, next) => {
    try {
        const {query} = req;
        await PayrollEmployeeSalary.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}