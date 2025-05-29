import Vehicle from "../models/vehicle.model";
import VehicleInfo from '../models/category_info.model';
import mongoose from 'mongoose'
import {getDistance, objectToKeyValuePair} from "../utils/common";
import * as geolib from 'geolib';
import ServicePrice from "../models/service_price.model";
import User from "../models/user.model";
import VehicleSetting from "../models/vehicle_setting.model";
import Settings from "../models/settings.model";
import Service from "../models/service.model";


export const createVehicle = async (req, res) => {
    try {
        const {body} = req;
        const {user} = res.locals;
        if (!!body._id) {
            await Vehicle.findByIdAndUpdate(body._id, {...body})
            return res.status(200).send({
                error: false,
                msg: 'Updated successfully'
            })
        }
        const isExit = await Vehicle.findOne({driver: user?._id});
        if (!!isExit) {
            return res.status(200).send({
                error: true,
                msg: 'Already registered a vehicle'
            })
        }
        delete body._id;
        !body.service_package && delete body.service_package
        const newVehicle = await Vehicle.create({...body, driver: user?._id});
        await User.findByIdAndUpdate(user?._id, {$set: {vehicle: newVehicle?._id}});
        return res.status(200).send({
            error: false,
            msg: 'Application received successfully, please wait for admin approval'
        })
    } catch (e) {
        console.log(e)
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const updateVehicleActive = async (req, res) => {
    try {
        const {vehicle_id, location, active} = req.body;
        let vehicle = await Vehicle.findById(vehicle_id);
        vehicle.position = {
            lat: location.lat,
            lng: location.lng
        }
        vehicle.location = {
            type: "Point",
            // @ts-ignore
            coordinates: [location.lng, location.lat,]
        }
        vehicle.active = active
        await vehicle.save();

        // @ts-ignore
        let data = await Vehicle.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(vehicle?._id)
                }
            },
            {
                $project: {
                    name: 1,
                    model_name: 1,
                    position: 1,
                    active: 1
                }
            }
        ])

        return res.status(200).send({
            error: false,
            msg: 'location updated',
            data: data[0]
        })

    } catch (e) {
        return res.status(500).json({
            error: true,
            msg: e.message
        })
    }
}


export const createVehicleSetting = async (req, res) => {
    try {
        const {body} = req;
        if (body._id) {
            await VehicleSetting.findByIdAndUpdate(body._id, {...body})
            return res.status(200).send({
                error: false,
                msg: 'Updated successfully'
            })
        }
        delete body._id;
        await VehicleSetting.create({...body});
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

export const deleteVehicleSetting = async (req, res) => {
    try {
        const {query} = req;
        await VehicleSetting.deleteOne({_id: new mongoose.Types.ObjectId(query?._id)});
        return res.status(200).send({
            error: false,
            msg: 'Deleted successfully'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchVehicleSettings = async (req, res, next) => {
    try {
        const {query} = req
        let filter: any = {}

        // @ts-ignore
        let data = await VehicleSetting.aggregatePaginate(VehicleSetting.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
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
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            {name: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                        ]
                    }
                }
            ] : []),
            {
                $lookup: {
                    from: 'services',
                    localField: 'service',
                    foreignField: '_id',
                    as: 'service'
                }
            },
            {$unwind: '$service'}
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
export const fetchVehicleSetting = async (req, res, next) => {
    try {
        const {query} = req
        let filter: any = {}

        // @ts-ignore
        let data = await VehicleSetting.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(query._id)
                }
            }
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

/**
 *  Old System
 * **/
// driver vehicle create/update
export const createVehicleOfDriver = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let {body} = req
        if (!!body._id) {
            if (!!req.body.details) {
                let details = await objectToKeyValuePair(req.body.details);
                delete body.details;
                await Vehicle.findOneAndUpdate({_id: body._id}, {...body, details})
            } else {
                await Vehicle.findOneAndUpdate({_id: body._id}, body)
            }
            return res.status(200).send({
                error: false,
                msg: 'Thanks! Information updated successfully'
            })

        } else {
            let details = await objectToKeyValuePair(req.body.details);
            let driverVehicle = await Vehicle.create([{
                parent: body.parent,
                driver: body.driver,
                details: details,
                location: body.location
            }], {session});
            // @ts-ignore
            await User.updateOne({_id: driverVehicle[0]?.driver}, {$set: {vehicle: driverVehicle[0]?._id}}, {session})
            await session.commitTransaction();
            // const decodeDetails = keyValuePairToObject(driverVehicle[0]?.details);
            return res.status(200).send({
                error: false,
                msg: 'Successfully created',
                data: {
                    _id: driverVehicle[0]?._id,
                    service_category: driverVehicle[0]?.service_category,
                    service_package: driverVehicle[0]?.service_package,
                    // details: decodeDetails,
                    approved: driverVehicle[0]?.approved,
                    // @ts-ignore
                    createdAt: driverVehicle[0]?.createdAt,
                    // @ts-ignore
                    updatedAt: driverVehicle[0]?.updatedAt,
                }
            })
        }
    } catch (e) {
        await session.abortTransaction()
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    } finally {
        await session.endSession()
    }
};

export const fetchVehicleList = async (req, res, next) => {
    try {
        const {query} = req
        let filter: any = {}
        if (!!query.search) {
            filter = {
                $or: [
                    {"name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"model_name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"service.name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"driver.email": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"driver.phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        let data = await Vehicle.aggregatePaginate(Vehicle.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            {
                $lookup: {
                    from: 'service_categories',
                    let: {"service_category": '$service_category'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ["$_id", "$$service_category"]}
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                image: 1
                            }
                        }
                    ],
                    as: 'service_category'
                }
            },
            {$unwind: {path: '$service_category', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'services',
                    let: {"service": '$service'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ["$_id", "$$service"]}
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                image: 1
                            }
                        }
                    ],
                    as: 'service'
                }
            },
            {$unwind: {path: '$service', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'users',
                    let: {"driver": '$driver'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ["$_id", "$$driver"]}
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                phone: 1,
                                image: 1
                            }
                        }
                    ],
                    as: 'driver'
                }
            },
            {$unwind: {path: '$driver', preserveNullAndEmptyArrays: true}},
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

export const fetchVehicle = async (req, res, next) => {
    try {
        const {query} = req
        // @ts-ignore
        let data = await Vehicle.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            ...(!!query.driver ? [
                {
                    $match: {
                        driver: new mongoose.Types.ObjectId(query.driver)
                    }
                },
            ] : []),
            {
                $lookup: {
                    from: 'service_categories',
                    let: {"service_category": '$service_category'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ["$_id", "$$service_category"]}
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                image: 1
                            }
                        }
                    ],
                    as: 'service_category'
                }
            },
            {$unwind: {path: '$service_category', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'services',
                    let: {"service": '$service'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ["$_id", "$$service"]}
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                image: 1
                            }
                        }
                    ],
                    as: 'service'
                }
            },
            {$unwind: {path: '$service', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'users',
                    let: {"driver": '$driver'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ["$_id", "$$driver"]}
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                phone: 1,
                                image: 1
                            }
                        }
                    ],
                    as: 'driver'
                }
            },
            {$unwind: {path: '$driver', preserveNullAndEmptyArrays: true}},
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

export const fetchVehicleDriverWise = async (req, res, next) => {
    try {
        const {query} = req
        const {user} = res.locals;
        // @ts-ignore
        let data = await Vehicle.aggregate([
            {
                $match: {
                    driver: new mongoose.Types.ObjectId(user._id)
                }
            },
            {
                $lookup: {
                    from: 'service_categories',
                    let: {"service_category": '$service_category'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ["$_id", "$$service_category"]}
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                            }
                        }
                    ],
                    as: 'service_category'
                }
            },
            {$unwind: {path: '$service_category', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'services',
                    let: {"service": '$service'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ["$_id", "$$service"]}
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                            }
                        }
                    ],
                    as: 'service'
                }
            },
            {$unwind: {path: '$service', preserveNullAndEmptyArrays: true}},
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

export const vehicleDocumentUpdate = async (req, res, next) => {
    try {
        const {body} = req
        const {user} = res.locals;
        if (user?.role === 'admin') {
            await Vehicle.updateOne({driver: body.driver}, {$set: {documents: body.documents}})
            return res.status(200).send({
                error: false,
                msg: 'Successfully update',
            })
        } else if (user?.role === 'driver') {
            await Vehicle.updateOne({driver: user._id}, {$set: {documents: body.documents}})
            return res.status(200).send({
                error: false,
                msg: 'Successfully update',
            })
        }
        return res.status(500).send({
            error: true,
            msg: 'Authorization failed'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const getDriverDocument = async (req, res, next) => {
    try {
        const {query} = req
        const {user} = res.locals;
        if (user?.role === 'admin') {
            if (!query?.driver) {
                return res.status(400).send({
                    error: true,
                    msg: 'Invalid request'
                })
            }
            const document = await Vehicle.findOne({driver: query?.driver}).select('documents')
            return res.status(200).send({
                error: false,
                data: document?.documents
            })
        } else if (user?.role === 'driver') {
            const document = await Vehicle.findOne({driver: user?._id}).select('documents')
            return res.status(200).send({
                error: false,
                data: document?.documents
            })
        }
        return res.status(500).send({
            error: true,
            msg: 'Authorization failed'
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchServiceWiseVehicles = async (req, res, next) => {
    try {
        const {query} = req
        let filter: any = {}

        // @ts-ignore
        let data = await Vehicle.aggregatePaginate(Vehicle.aggregate([
            {
                $match: {
                    service: new mongoose.Types.ObjectId(query.service)
                }
            },
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
                    name: "$name.name",
                    vehicle_model: 1,
                    image: 1,
                    description: 1,
                    createdAt: 1,
                    updatedAt: 1,
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

export const updateDriverLocation = async (req, res) => {
    try {
        const {vehicle_id, location} = req.body;
        let vehicle = await Vehicle.findById(vehicle_id);
        vehicle.position = {
            lat: location.lat,
            lng: location.lng
        }
        vehicle.location = {
            type: "Point",
            // @ts-ignore
            coordinates: [location.lng, location.lat,]
        }
        await vehicle.save();

        // @ts-ignore
        let data = await Vehicle.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(vehicle?._id)
                }
            },
            {
                $project: {
                    name: 1,
                    model_name: 1,
                    updatedAt: 1,
                    position: 1,
                    location: 1,
                }
            }
        ])

        return res.status(200).send({
            error: false,
            msg: 'location updated',
            data: data[0]
        })

    } catch (e) {
        return res.status(500).json({
            error: true,
            msg: e.message
        })
    }
}

export const nearVehicleSearchFromUserPoint = async (req, res) => {
    try {
        const {query} = req;
        // const {location, service, service_category} = req.body;
        const {service_category, service, pickup_location, destination_location} = req.body;
        const settings = await Settings.findOne({}).select('max_distance');

        const aggregationPipeline = [
            {
                "$geoNear": {
                    "near": {
                        "type": "Point",
                        "coordinates": [parseFloat(pickup_location.lng), parseFloat(pickup_location.lat)]
                    },
                    "distanceField": "dist.calculated",
                    "spherical": true,
                }
            },
            {
                $match: {
                    service: new mongoose.Types.ObjectId(service),
                    service_category: new mongoose.Types.ObjectId(service_category),
                    approved: true,
                    engage: false,
                    active: true
                }
            },
            {
                $project: {
                    name: 1,
                    model_name: 1,
                    dist: 1,
                    seats: {$ifNull: ["$features.capacity", 0]},
                    gear_type: {$ifNull: ["$features.gear_type", 'manual']},
                    fuel_type: {$ifNull: ["$features.fuel_type", "octane"]},
                    images: 1,
                    description: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    service_vehicle: 1,
                    service_category: 1,
                    service_package: 1,
                    service: 1,
                    position: 1,
                    driver: 1
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
            {
                $sort: {"dist.calculated": 1}
            },
            {
                $limit: 20
            },
        ]

        if (settings?.max_distance > 0) {
            // @ts-ignore
            aggregationPipeline[0].$geoNear.maxDistance = settings?.max_distance;
        }

        // @ts-ignore
        let match = await Vehicle.aggregate(aggregationPipeline)

        const locations = [];
        for (let i = 0; i < match?.length; i++) {
            let vehicleInfo = match[i];
            let {service_vehicle, service_category, service, service_package} = vehicleInfo;

            let source = {
                latitude: pickup_location?.lat,
                longitude: pickup_location?.lng,
            }
            let driverVehicleDestination = {
                latitude: vehicleInfo?.position?.lat,
                longitude: vehicleInfo?.position?.lng,
            }
            let destination = {
                latitude: destination_location?.lat,
                longitude: destination_location?.lng,
            }
            const vehicle = await getDistance(source, destination);
            const getDriverDistance = await getDistance(source, driverVehicleDestination);
            const fare = await getTotalFareAmount({service_vehicle, service_category, service, service_package, vehicle, waiting_time: 0})
            locations.push({...vehicleInfo, vehicle: getDriverDistance, fare});
        }

        return res.status(200).send({
            error: false,
            data: {
                vehicles: locations
            }
        })

    } catch (e) {
        return res.status(500).json({
            error: true,
            msg: e.message
        })
    }
}

export const nearestVehiclesAndServiceVehicleTypes = async (req, res) => {
    try {
        const {query} = req;
        const {service_category, pickup_location, destination_location} = req.body;
        const settings = await Settings.findOne({}).select('max_distance');

        const aggregationPipeline = [
            {
                "$geoNear": {
                    "near": {
                        "type": "Point",
                        "coordinates": [parseFloat(pickup_location.lng), parseFloat(pickup_location.lat)]
                    },
                    "distanceField": "dist.calculated",
                    "spherical": true,
                }
            },
            {
                $match: {
                    service_category: new mongoose.Types.ObjectId(service_category),
                    approved: true,
                    engage: false,
                    active: true
                }
            },
            {
                $project: {
                    name: 1,
                    model_name: 1,
                    seats: {$ifNull: ["$features.capacity", 0]},
                    gear_type: {$ifNull: ["$features.gear_type", 'manual']},
                    fuel_type: {$ifNull: ["$features.fuel_type", "octane"]},
                    images: 1,
                    description: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    service_vehicle: 1,
                    service_category: 1,
                    service_package: 1,
                    service: 1,
                    position: 1,
                    driver: 1
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
            {
                $sort: {"dist.calculated": 1}
            },
            {
                $limit: 3
            },
        ];

        if (settings?.max_distance > 0) {
            // @ts-ignore
            aggregationPipeline[0].$geoNear.maxDistance = settings?.max_distance;
        }

        // @ts-ignore
        let match = await Vehicle.aggregate(aggregationPipeline)

        // category wise services
        let services = await Service.aggregate([
            {
                $match: {
                    categories: {$in: [new mongoose.Types.ObjectId(service_category), '$categories']}
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

        const locations = [];
        for (let i = 0; i < match?.length; i++) {
            let vehicleInfo = match[i];
            let {service_vehicle, service_category, service, service_package} = vehicleInfo;

            let source = {
                latitude: pickup_location?.lat,
                longitude: pickup_location?.lng,
            }
            let driverVehicleDestination = {
                latitude: vehicleInfo?.position?.lat,
                longitude: vehicleInfo?.position?.lng,
            }
            let destination = {
                latitude: destination_location?.lat,
                longitude: destination_location?.lng,
            }
            const vehicle = await getDistance(source, destination);
            const getDriverDistance = await getDistance(source, driverVehicleDestination);
            const fare = await getTotalFareAmount({service_vehicle, service_category, service, service_package, vehicle, waiting_time: 0})
            locations.push({...vehicleInfo, vehicle: getDriverDistance, fare});
        }

        return res.status(200).send({
            error: false,
            data: {
                vehicles: locations,
                services
            }
        })

    } catch (e) {
        return res.status(500).json({
            error: true,
            msg: e.message
        })
    }
}


export const getCurrentDriverPosition = async (req, res) => {
    try {
        const {query} = req;
        const driver = await Vehicle.findOne({driver: new mongoose.Types.ObjectId(query?.driver_id)}).select('position -_id');
        return res.status(200).send({
            error: false,
            msg: "Driver's current position",
            data: driver?.position || {}
        })
    } catch (e) {
        return res.status(500).json({
            error: true,
            msg: e.message
        })
    }
}

export const nearestSelectedVehicleDetails = async (req, res) => {
    try {
        const {location, parent} = req.body;
        const {query} = req;
        let filter: any;

        let match = await Vehicle.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(query._id)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'driver',
                    foreignField: "_id",
                    as: 'driver'
                }
            },
            {$unwind: {path: '$driver', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'driver_ratings',
                    let: {"driver": "$driver._id"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {$eq: ["$driver", "$$driver"]}
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                let: {"user": "$user"},
                                pipeline: [
                                    {
                                        $match: {$expr: {$eq: ["$_id", "$$user"]}}
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            name: 1,
                                            email: 1,
                                            phone: 1,
                                            createdAt: 1
                                        }
                                    }
                                ],
                                as: 'user'
                            }
                        },
                        {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
                        {
                            $group: {
                                _id: null,
                                driver: {$first: "$driver"},
                                count: {$count: {}},
                                rating: {$sum: "$rating"},
                                reviews: {$push: {review: "$comment", user: "$user", rating: '$rating'}}
                            }
                        },
                        {
                            $project: {
                                average_rating: {$round: [{$divide: ["$rating", "$count"]}, 2]},
                                total_reviews: {$ifNull: ["$count", 0]},
                            }
                        }
                    ],
                    as: 'rating'
                }
            },
            {$unwind: {path: '$rating', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    driver: {
                        _id: "$driver._id",
                        name: "$driver.name",
                        verified: "$driver.verified",
                        email: "$driver.email",
                        phone: "$driver.phone",
                        image: "$driver.image",
                    },
                    name: 1,
                    model_name: 1,
                    rating: {$ifNull: ["$rating", {}]},
                    position: 1,
                    dist: 1,
                    engage: 1,
                    active: 1,
                    approved: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    features: 1,
                    specifications: 1,
                    images: 1,
                    service_category: 1,
                    service_package: 1,
                    service: 1,
                    service_vehicle: 1,
                    // details: {
                    //     $arrayToObject: {
                    //         $map: {
                    //             input: "$details",
                    //             as: "item",
                    //             in: [
                    //                 "$$item.key",
                    //                 "$$item.value"
                    //             ]
                    //         }
                    //     }
                    // }
                }
            },
        ])

        return res.status(200).send({
            error: false,
            data: match[0]
        })

    } catch
        (e) {
        return res.status(500).json({
            error: true,
            msg: e.message
        })
    }
}

export const verifyDriverVehicle = async (req, res, next) => {
    try {
        const {user} = res.locals;
        // @ts-ignore
        const isExit = await Vehicle.findOne({driver: user?._id});
        if (!!isExit) {
            return res.status(400).json({
                error: false,
                data: {
                    msg: "Already registered a vehicle. Go to your dashboard and check your vehicle approval status. Or" +
                        " please wait for admin approval.",
                    error: true
                }
            })
        }
        return res.status(200).json({
            error: false,
            msg: "Thanks for choosing us"
        })
    } catch (e) {
        return res.status(200).json({
            error: true,
            data: "Server side error"
        })
    }
}

export const distanceCalculationFromUserLocationToDestination = async (req, res, next) => {
    try {
        const {body} = req;
        const {lat: userLat, lng: userLng} = body.userLocation;
        const {lat: destLat, lng: destLng} = body.destLocation;

        const distance = geolib.getDistance(
            {latitude: userLat, longitude: userLng},
            {latitude: destLat, longitude: destLng}
        );

        return res.status(500).json({
            error: false,
            data: {distance, measured_metric: 'Meter'}
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}


export const delVehicle = async (req, res, next) => {
    try {
        const {query} = req;
        await Vehicle.findByIdAndDelete(query._id);
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
 * vehicle information
 * */
export const postVehicleInfo = async (req, res, next) => {
    try {
        const {body} = req;
        if (body?._id) {
            await VehicleInfo.findByIdAndUpdate(body?._id, {$set: body});

            return res.status(200).send({
                error: false,
                msg: "Vehicle info updated successfully"
            })

        } else {
            await VehicleInfo.create({
                service_vehicle: new mongoose.Types.ObjectId(body.service_vehicle),
                earning_currency: body.earning_currency,
                earning_money: body.earning_money,

                section1_title: body.section1_title,
                section1_sub_title: body.section1_sub_title,
                section1_data: body.section1_data,

                section2_title: body.section2_title,
                section2_sub_title: body.section2_sub_title,
                section2_data: body.section2_data,
                services: body.services,
            });

            return res.status(200).send({
                error: false,
                msg: "Vehicle extra information added"
            })
        }

    } catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        })
    }
}

// vehicle information
export const getVehicleInfo = async (req, res, next) => {
    try {
        const info = await VehicleInfo.aggregate([
            {$match: {service_vehicle: new mongoose.Types.ObjectId(req.query.vehicle)}},
            {
                $lookup: {
                    from: 'service_vehicles',
                    localField: 'service_vehicle',
                    foreignField: '_id',
                    as: 'vehicle'
                }
            },
            {$unwind: '$vehicle'}
        ])

        return res.status(200).send({
            error: false,
            data: info[0]
        })

    } catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        })
    }
}

// delete information
export const delVehicleInfo = async (req, res, next) => {
    try {

        await VehicleInfo.findByIdAndDelete(req.query.id);

        return res.status(200).send({
            error: false,
            msg: "Vehicle info deleted successfully"
        })


    } catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        })
    }
}

// vehicle information
export const getAllVehicleInfo = async (req, res, next) => {
    try {
        const allVehicleInfo = await VehicleInfo.aggregate([
            {$match: {}},
            {
                $lookup: {
                    from: 'service_vehicles',
                    localField: 'service_vehicle',
                    foreignField: '_id',
                    as: 'vehicle'
                }
            },
            {$unwind: '$vehicle'},
            {
                $project: {
                    vehicle: "$vehicle.name",
                    services: 1
                }
            },
            {$unwind: '$services'},
            {$group: {_id: null, services: {$addToSet: {$toLower: "$services"}}}},
        ])

        return res.status(200).send({
            error: false,
            data: allVehicleInfo[0]
        })

    } catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        })
    }
}


export const getFare = async (req, res) => {
    try {
        let {body} = req;
        const servicePrice = await ServicePrice.findOne({
            category: new mongoose.Types.ObjectId(body.category),
            service_package: new mongoose.Types.ObjectId(body.service_package),
            service: new mongoose.Types.ObjectId(body.service),
            service_vehicle: new mongoose.Types.ObjectId(body.service_vehicle),
        });
        if (!servicePrice) {
            return res.status(404).json({
                error: true,
                msg: 'fare not found'
            })
        }
        const vehicle = await getDistance(body?.source, body?.destination);
        const kmDistance = Number((vehicle?.distance?.value / 1000).toFixed(2))

        // @ts-ignore
        const additionalFare = servicePrice?.additional_fees.reduce((accumulator, currentValue) => accumulator += currentValue.additional_fee, 0);
        // @ts-ignore
        const fares = Number((Number(servicePrice.base_fair) + (Number(servicePrice.per_kilo_charge) * Number(kmDistance)) + (Number(servicePrice?.waiting_charge || 0) * Number(body?.waiting_time || 0))).toFixed(2));
        const subtotal = Number(((+fares) + (+additionalFare)).toFixed(2));

        let total: number = 0;
        let company_commission;
        if (servicePrice?.commission_type === 'fixed_amount') {
            total = Number((subtotal + Number(servicePrice?.company_commission)).toFixed(2))
            company_commission = servicePrice?.company_commission;
        } else if (servicePrice?.commission_type === 'percentage') {
            total = Number((subtotal + (subtotal * (Number(servicePrice?.company_commission) / 100))).toFixed(2))
            company_commission = `${servicePrice?.company_commission}%`;
        }

        return res.status(200).send({
            error: false,
            msg: 'success',
            data: {
                fares: Number(fares).toFixed(2),
                additional_fares: Number(additionalFare).toFixed(2),
                subtotal: Number(subtotal).toFixed(2),
                vat: company_commission,
                vat_amount: Number((total - subtotal)).toFixed(2),
                total: Number(total).toFixed(2),
                distance: Number(kmDistance).toFixed(2)
            }
        })

    } catch (e) {
        return {
            error: true,
            msg: 'server_failed'
        }
    }
}

export const getTestingRideDistance = async (req, res) => {
    try {
        let {body} = req;
        const vehicle = await getDistance(body?.source, body?.destination);
        const kmDistance = Number((vehicle?.distance?.value / 1000).toFixed(2))
        console.log("distance : ", {...vehicle, kmDistance})
        return res.status(200).send({
            error: false,
            msg: 'success',
            data: {...vehicle, kmDistance}
        })
    } catch (e) {
        return {
            error: true,
            msg: 'server_failed'
        }
    }
}

export const getTotalFareAmount = async ({service_vehicle, service_category, service, service_package, vehicle, waiting_time}) => {
    const servicePrice = await ServicePrice.findOne({
        category: service_category,
        service_package: service_package,
        service: service,
        service_vehicle: service_vehicle,
    });
    if (!servicePrice) {
        return {}
    }
    const kmDistance = vehicle?.distance?.value / 1000

    // @ts-ignore
    const additionalFare = servicePrice?.additional_fees.reduce((accumulator, currentValue) => accumulator += currentValue.additional_fee, 0);
    // @ts-ignore
    const fares = Number((Number(servicePrice.base_fair) + (Number(servicePrice.per_kilo_charge) * Number(kmDistance)) + (Number(servicePrice?.waiting_charge || 0) * Number(waiting_time || 0))).toFixed(2));
    const subtotal = Number(((+fares) + (+additionalFare)).toFixed(2));

    let total: number = 0;
    let company_commission;
    if (servicePrice?.commission_type === 'fixed_amount') {
        total = Number((subtotal + Number(servicePrice?.company_commission)).toFixed(2))
        company_commission = servicePrice?.company_commission;
    } else if (servicePrice?.commission_type === 'percentage') {
        total = Number((subtotal + (subtotal * (Number(servicePrice?.company_commission) / 100))).toFixed(2))
        company_commission = `${servicePrice?.company_commission}%`;
    }

    return {
        fares: Number(fares).toFixed(2),
        additional_fares: Number(additionalFare).toFixed(2),
        subtotal: Number(subtotal).toFixed(2),
        vat: company_commission,
        vat_amount: Number((total - subtotal)).toFixed(2),
        total: Number(total).toFixed(2),
        distance: kmDistance,
        currency: servicePrice?.currency
    }
}