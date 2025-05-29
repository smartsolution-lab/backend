import {geocoder} from '../utils/geo_coder';
import Location from '../models/location.model';
import mongoose from "mongoose";

// post location
export const postLocation = async (req, res, next) => {
    try {
        const {body} = req;
        console.log(body)
        if (body._id) {
            await Location.findByIdAndUpdate(body._id, {$set: body})
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            })

        } else {
            delete body._id
            const polygon = new Location({
                name: body.name,
                address: body.address,
                state: body.state,
                country: body.country,
                timezone: body.timezone,
                distance_unit: body.distance_unit,
                location_type: 'polygon',
                location: body.location,
                active: body.active,
            });

            await polygon.save();

            return res.status(200).json({
                error: false,
                msg: 'The location has been successfully added',
            })
        }

    } catch (error) {
        console.log(error)
        if (error.code === 11000) {
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


// get location
export const getLocationList = async (req, res, next) => {
    try {
        const {query} = req;
        let filter: any = {};

        if (query.search) {
            filter = {
                $or: [
                    {name: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {address: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }

        // @ts-ignore
        const locations = await Location.aggregatePaginate(Location.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            {$match: filter},
            {$sort: {createdAt: -1}}
        ]));
        return res.status(200).json({
            error: false,
            data: locations
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}


// delete location
export const delLocation = async (req, res, next) => {
    try {
        const {query} = req;

        await Location.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Location Deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}


// check user location inside of map area, according to user location (Point type)
export const userAreaCheckInsideOfMap = async (req, res, next) => {
    try {
        const {body} = req;
        const loc = await geocoder.geocode(body.address);
        const location = {
            type: 'Point',
            coordinates: [loc[0].longitude, loc[0].latitude],
            formattedAddress: loc[0].formattedAddress
        };

        const longitude = location.coordinates[0];
        const latitude = location.coordinates[1];

        const findNearLoc = await Location.find({
            location: {$geoIntersects: {$geometry: {type: 'Point', coordinates: [longitude, latitude]}}}
        });

        return res.status(200).json({
            error: false,
            location,
            longitude,
            latitude,
            findNearLoc
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}