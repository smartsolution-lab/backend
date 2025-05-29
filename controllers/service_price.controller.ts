import mongoose from 'mongoose';
import ServicePrice from '../models/service_price.model';


export const createServicePrice = async (req, res, next) => {
    try {
        if (!!req.body._id) {
            await ServicePrice.updateOne({_id: new mongoose.Types.ObjectId(req.body._id)}, {$set: req.body}, {validateBeforeSave: false});
            return res.status(200).json({
                error: false,
                msg: 'updated successful'
            });
        } else {
            delete req.body._id
            const isExist = await ServicePrice.findOne({
                category: new mongoose.Types.ObjectId(req.body.category),
                service_package: new mongoose.Types.ObjectId(req.body.service_package),
                service: new mongoose.Types.ObjectId(req.body.service),
                service_vehicle: new mongoose.Types.ObjectId(req.body.service_vehicle),
            })
            if(!!isExist) {
                return res.status(400).json({
                    error: true,
                    msg: "Already price added"
                })
            }

            const price = await ServicePrice.create(req.body);
            if (!price) return res.status(400).json({error: true, msg: "Wrong input!"});
            return res.status(200).json({
                error: false,
                data: price,
                msg: "Service fare added successfully"
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

// find tax price by vehicle id
export const getOneServicePrice = async (req, res, next) => {
    try {
        const {query} = req;
        const prices = await ServicePrice.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            ...(!!query.category ? [
                {
                    $match: {
                        category: new mongoose.Types.ObjectId(query.category)
                    }
                }
            ] : []),
            ...(!!query.service_package ? [
                {
                    $match: {
                        service_package: new mongoose.Types.ObjectId(query.service_package)
                    }
                }
            ] : []),
            ...(!!query.service_vehicle ? [
                {
                    $match: {
                        service_vehicle: new mongoose.Types.ObjectId(query.service_vehicle)
                    }
                }
            ] : []),
            ...(!!query.service ? [
                {
                    $match: {
                        service: new mongoose.Types.ObjectId(query.service)
                    }
                }
            ] : []),
            {
                $lookup: {
                    from: "service_categories",
                    localField: "category",
                    foreignField: "_id",
                    as: 'category'
                }
            },
            {$unwind: {path: '$category', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "service_packages",
                    localField: "service_package",
                    foreignField: "_id",
                    as: 'service_package'
                }
            },
            {$unwind: {path: '$service_package', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "services",
                    localField: "service",
                    foreignField: "_id",
                    as: 'service'
                }
            },
            {$unwind: {path: '$service', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "service_vehicles",
                    localField: "service_vehicle",
                    foreignField: "_id",
                    as: 'service_vehicle'
                }
            },
            {$unwind: {path: '$service_vehicle', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "vehicle_settings",
                    let: {"service_vehicle": "$service_vehicle.name"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$service_vehicle"]
                                }
                            }
                        }
                    ],
                    as: 'vehicle_settings'
                }
            },
            {$unwind: {path: '$vehicle_settings', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    category: {
                        _id: "$category._id",
                        name: {$ifNull: ["$category.name", "-"]},
                    },
                    service_package: {
                        _id: "$service_package._id",
                        name: {$ifNull: ["$service_package.name", "-"]},
                    },
                    service: {
                        _id: "service._id",
                        name: {$ifNull: ["$service.name", "-"]},
                    },
                    service_vehicle: {
                        _id: "$service_vehicle._id",
                        name: {$ifNull: ["$vehicle_settings.name", "-"]},
                        model: "$service_vehicle.vehicle_model"
                    },
                    currency: 1,
                    base_fair: 1,
                    per_kilo_charge: 1,
                    waiting_charge: 1,
                    minimum_fair: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    cancellation_fee: 1,
                    commission_type: 1,
                    company_commission: 1,
                    additional_fees: 1,
                }
            },
        ])
        return res.status(200).json({
            error: false,
            data: prices[0]
        })
    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}


export const getServicePriceById = async (req, res, next) => {
    try {
        const {query} = req;
        const prices = await ServicePrice.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(query._id)
                }
            },
            {
                $lookup: {
                    from: "service_categories",
                    localField: "category",
                    foreignField: "_id",
                    as: 'category'
                }
            },
            {$unwind: {path: '$category', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "service_packages",
                    localField: "service_package",
                    foreignField: "_id",
                    as: 'service_package'
                }
            },
            {$unwind: {path: '$service_package', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "services",
                    localField: "service",
                    foreignField: "_id",
                    as: 'service'
                }
            },
            {$unwind: {path: '$service', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "service_vehicles",
                    localField: "service_vehicle",
                    foreignField: "_id",
                    as: 'service_vehicle'
                }
            },
            {$unwind: {path: '$service_vehicle', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "vehicle_settings",
                    let: {"service_vehicle": "$service_vehicle.name"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$service_vehicle"]
                                }
                            }
                        }
                    ],
                    as: 'vehicle_settings'
                }
            },
            {$unwind: {path: '$vehicle_settings', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    category: {
                        _id: "$category._id",
                        name: {$ifNull: ["$category.name", "-"]},
                    },
                    service_package: {
                        _id: "$service_package._id",
                        name: {$ifNull: ["$service_package.name", "-"]},
                    },
                    service: {
                        _id: "service._id",
                        name: {$ifNull: ["$service.name", "-"]},
                    },
                    service_vehicle: {
                        _id: "$service_vehicle._id",
                        name: {$ifNull: ["$vehicle_settings.name", "-"]},
                        model: "$service_vehicle.vehicle_model"
                    },
                    currency: 1,
                    base_fair: 1,
                    per_kilo_charge: 1,
                    waiting_charge: 1,
                    minimum_fair: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    cancellation_fee: 1,
                    commission_type: 1,
                    company_commission: 1,
                    additional_fees: 1,
                }
            },
        ])
        return res.status(200).json({
            error: false,
            data: prices[0]
        })
    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}


export const getServicePrices = async (req, res, next) => {
    try {
        const {query} = req;
        let match: any = {}
        if (query.search) {
            match = {
                $or: [
                    {"service_vehicle.name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"service_vehicle.model": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"category.name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"service_package.name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const prices = await ServicePrice.aggregatePaginate(ServicePrice.aggregate([
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
                        category: new mongoose.Types.ObjectId(query.category)
                    }
                }
            ] : []),
            ...(!!query.service_package ? [
                {
                    $match: {
                        service_package: new mongoose.Types.ObjectId(query.service_package)
                    }
                }
            ] : []),
            ...(!!query.service_vehicle ? [
                {
                    $match: {
                        service_vehicle: new mongoose.Types.ObjectId(query.service_vehicle)
                    }
                }
            ] : []),
            ...(!!query.service ? [
                {
                    $match: {
                        service: new mongoose.Types.ObjectId(query.service)
                    }
                }
            ] : []),
            {
                $lookup: {
                    from: "service_categories",
                    localField: "category",
                    foreignField: "_id",
                    as: 'category'
                }
            },
            {$unwind: {path: '$category', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "service_packages",
                    localField: "service_package",
                    foreignField: "_id",
                    as: 'service_package'
                }
            },
            {$unwind: {path: '$service_package', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "services",
                    localField: "service",
                    foreignField: "_id",
                    as: 'service'
                }
            },
            {$unwind: {path: '$service', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "service_vehicles",
                    localField: "service_vehicle",
                    foreignField: "_id",
                    as: 'service_vehicle'
                }
            },
            {$unwind: {path: '$service_vehicle', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "vehicle_settings",
                    let: {"service_vehicle": "$service_vehicle.name"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$service_vehicle"]
                                }
                            }
                        }
                    ],
                    as: 'vehicle_settings'
                }
            },
            {$unwind: {path: '$vehicle_settings', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    category: {
                        _id: "$category._id",
                        name: {$ifNull: ["$category.name", "-"]},
                    },
                    service_package: {
                        _id: "$service_package._id",
                        name: {$ifNull: ["$service_package.name", "-"]},
                    },
                    service: {
                        _id: "$service._id",
                        name: {$ifNull: ["$service.name", "-"]},
                    },
                    service_vehicle: {
                        _id: "$service_vehicle._id",
                        name: {$ifNull: ["$vehicle_settings.name", "-"]},
                        model: "$service_vehicle.vehicle_model"
                    },
                    createdAt: 1,
                    updatedAt: 1,
                }
            },
            {$match: match},
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        });

        return res.status(200).json({
            error: false,
            data: prices
        })

    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}


export const deleteServicePrice = async (req, res, next) => {
    try {
        await ServicePrice.findByIdAndDelete(req.query._id);
        return res.status(200).json({
            error: false,
            msg: 'Successfully Deleted'
        })
    } catch (err) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}