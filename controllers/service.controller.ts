import mongoose from "mongoose";
import Service from "../models/service.model";
import FormField from "../models/form_field.model";
import UserFormField from "../models/user_form_field.model";
import ServiceVehicle from "../models/service_vehicle.model";
import CategoryInfo from "../models/category_info.model";


export const postService = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let {body} = req;
        if (!!body._id) {
            await Service.findOneAndUpdate({_id: body._id}, body)
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated'
            })
        } else {
            delete body._id;
            const vehicle = await Service.create([{
                ...body,
                name: body.name?.split(' ').join('_').toLowerCase()
            }], {session})

            if (!vehicle[0]?._id) return res.status(400).json({error: true, msg: 'Something wrong!'})

            const allFieldOne = await FormField.find({step_name: 'step_one'});
            const allFieldTwo = await FormField.find({step_name: 'step_two'});

            await UserFormField.create([{service_vehicle: new mongoose.Types.ObjectId(vehicle[0]?._id)}], {session})

            await UserFormField.updateOne(
                {service_vehicle: new mongoose.Types.ObjectId(vehicle[0]?._id)},
                {$set: {step_one: allFieldOne, step_two: allFieldTwo}},
                {upsert: true, session}
            );

            await session.commitTransaction();

            return res.status(200).send({
                error: false,
                msg: 'Vehicle added successfully',
                data: vehicle
            })
        }

    } catch (e) {
        await session.abortTransaction();
        if (e?.code === 11000) {
            return res.status(406).send({
                error: true,
                msg: 'Vehicle already exists',
            })
        }
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })

    } finally {
        await session.endSession();
    }
}

export const fetchServiceList = async (req, res, next) => {
    try {
        const {query} = req
        let filter: any = {};
        // @ts-ignore
        let data = await Service.aggregatePaginate(Service.aggregate([
            {
                $project: {
                    name: 1,
                    description: 1,
                    image: 1,
                    createdAt: 1,
                }
            },
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            {name: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        })

        return res.status(200).send({
            error: false,
            msg: 'Successfully get vehicles',
            data
        })

    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchServices = async (req, res, next) => {
    try {
        const {query} = req
        let filter: any = {};

        // @ts-ignore
        let data = await Service.aggregatePaginate(Service.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                }
            ] : []),
            ...(!!query.category ? [
                {
                    $match: {
                        categories: {$in: [new mongoose.Types.ObjectId(query.category), '$categories']}
                    }
                }
            ] : []),
            ...(!!query.service_package ? [
                {
                    $match: {
                        service_packages: {$in: [new mongoose.Types.ObjectId(query.service_package), '$service_packages']}
                    }
                }
            ] : []),
            {
                $lookup: {
                    from: 'service_categories',
                    let: {"ids": "$categories"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$in: ["$_id", "$$ids"]}
                            }
                        }
                    ],
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'service_packages',
                    let: {"ids": "$service_packages"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$in: ["$_id", "$$ids"]}
                            }
                        }
                    ],
                    as: 'service_packages'
                }
            },
            {
                $project: {
                    service_packages: 1,
                    categories: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    createdAt: 1,
                }
            },
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            {name: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        })
        return res.status(200).send({
            error: false,
            msg: 'Successfully get services',
            data
        })

    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchCategoriesPackagesByService = async (req, res, next) => {
    try {
        const {query} = req
        let filter: any = {};

        // @ts-ignore
        let data = await Service.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(query._id)
                }
            },
            {
                $lookup: {
                    from: 'service_categories',
                    let: {"ids": "$categories"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$in: ["$_id", "$$ids"]}
                            }
                        }
                    ],
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'service_packages',
                    let: {"ids": "$service_packages"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$in: ["$_id", "$$ids"]}
                            }
                        }
                    ],
                    as: 'service_packages'
                }
            },
            {
                $project: {
                    categories: 1,
                    service_packages: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    createdAt: 1,
                }
            },
        ])
        return res.status(200).send({
            error: false,
            msg: 'Successfully get services',
            data
        })

    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}


export const fetchServicesCategoryWise = async (req, res, next) => {
    try {
        const {query} = req
        // @ts-ignore
        let data = await Service.aggregate([
            {
                $match: {
                    categories: {$in: [new mongoose.Types.ObjectId(query.category), '$categories']}
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    image: 1,
                    createdAt: 1,
                }
            },
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            {name: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                        ]
                    }
                }
            ] : []),
        ])
        return res.status(200).send({
            error: false,
            msg: 'Successfully get services',
            data: {
                services: data
            }
        })

    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchService = async (req, res, next) => {
    try {
        const {query} = req;
        const vehicle = await Service.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(query._id)
                }
            },
            {
                $lookup: {
                    from: 'service_categories',
                    let: {"ids": "$categories"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$in: ["$_id", "$$ids"]}
                            }
                        }
                    ],
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'service_packages',
                    let: {"ids": "$service_packages"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$in: ["$_id", "$$ids"]}
                            }
                        }
                    ],
                    as: 'service_packages'
                }
            },
        ])
        return res.status(200).json({
            error: false,
            data: vehicle[0]
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const delService = async (req, res, next) => {
    try {
        const {query} = req;
        await Service.findByIdAndDelete(query._id);
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
 * Service Vehicle
 * **/
export const postServiceVehicle = async (req, res) => {
    try {
        const {body} = req;
        if (body._id) {
            await ServiceVehicle.findByIdAndUpdate(body._id, {...body})
            return res.status(200).send({
                error: false,
                msg: 'Updated successfully'
            })
        }
        delete body._id;
        await ServiceVehicle.create({...body});
        return res.status(200).send({
            error: false,
            msg: 'Created successfully'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchServiceVehicleList = async (req, res, next) => {
    try {
        const {query} = req
        let filter: any = {}
        if (!!query.search) {
            filter = {
                $or: [
                    {"name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"category": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"service": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"package": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        let data = await ServiceVehicle.aggregatePaginate(ServiceVehicle.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            ...(!!query.service ? [
                {
                    $match: {
                        service: new mongoose.Types.ObjectId(query.service)
                    }
                },
            ] : []),
            ...(!!query.service_package ? [
                {
                    $match: {
                        service_package: new mongoose.Types.ObjectId(query.service_package)
                    }
                },
            ] : []),
            {
                $lookup: {
                    from: 'service_categories',
                    localField: 'service_category',
                    foreignField: "_id",
                    as: 'service_category'
                }
            },
            {$unwind: {path: '$service_category', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'service_packages',
                    localField: 'service_package',
                    foreignField: "_id",
                    as: 'service_package'
                }
            },
            {$unwind: {path: '$service_package', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'services',
                    localField: 'service',
                    foreignField: "_id",
                    as: 'service'
                }
            },
            {$unwind: {path: '$service', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'vehicle_settings',
                    localField: 'name',
                    foreignField: "_id",
                    as: 'name'
                }
            },
            {$unwind: {path: '$name', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    category: "$service_category.name",
                    package: "$service_package.name",
                    service: "$service.name",
                    name: "$name.name",
                    image: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    vehicle_model: 1,
                    description: 1,
                }
            },
            {$match: filter},
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        });
        return res.status(200).send({
            error: false,
            msg: 'Successfully get vehicles',
            data
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchServiceVehicle = async (req, res, next) => {
    try {
        const {query} = req
        // @ts-ignore
        let data = await ServiceVehicle.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(query._id)
                }
            },
            {
                $lookup: {
                    from: 'service_categories',
                    localField: 'service_category',
                    foreignField: "_id",
                    as: 'service_category'
                }
            },
            {$unwind: {path: '$service_category', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'service_packages',
                    localField: 'service_package',
                    foreignField: "_id",
                    as: 'service_package'
                }
            },
            {$unwind: {path: '$service_package', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'services',
                    localField: 'service',
                    foreignField: "_id",
                    as: 'service'
                }
            },
            {$unwind: {path: '$service', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'vehicle_settings',
                    localField: 'name',
                    foreignField: "_id",
                    as: 'name'
                }
            },
            {$unwind: {path: '$name', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    service_category: {
                        _id: "$service_category._id",
                        name: "$service_category.name"
                    },
                    service_package: {
                        _id: "$service_package._id",
                        name: "$service_package.name"
                    },
                    service: {
                        _id: "$service._id",
                        name: "$service.name"
                    },
                    name: {
                        _id: "$name._id",
                        name: "$name.name"
                    },
                    image: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    details: {$ifNull: ["$details", 0]},
                    specifications: {$ifNull: ["$specifications", 0]},
                    vehicle_model: 1,
                    description: 1
                }
            },
        ])
        return res.status(200).send({
            error: false,
            msg: 'Successfully get vehicles',
            data: data[0]
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const delServiceVehicle = async (req, res, next) => {
    try {
        const {query} = req;
        await ServiceVehicle.findByIdAndDelete(query._id);
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