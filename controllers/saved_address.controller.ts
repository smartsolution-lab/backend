import SavedAddress from "../models/saved_address.model";
import mongoose from "mongoose";
import TripRequest from "../models/trip_request.model";

export const postSavedAddress = async (req, res) => {
    try {
        const {body} = req;
        const {user} = res.locals;
        if(!!body?._id) {
            await SavedAddress.findByIdAndUpdate(body?._id, {$set: {...body}});
            return res.status(200).json({
                error: false,
                msg: 'Address updated successfully',
            })
        } else {
            delete body?._id
            await SavedAddress.create({...body, user: user?._id});
            return res.status(200).json({
                error: false,
                msg: 'Address saved successfully',
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}

export const getSavedAddress = async (req, res) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        const addresses = await SavedAddress.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            {
                $match: {user: user?._id}
            },
        ])

        const latestTrip = await TripRequest.aggregate([
            {
                $match: {user: user?._id}
            },
            {$sort: {createdAt: -1}},
            {$limit: 30},
            {
              $group: {
                  _id: {location: "$pickupLocation.address"},
                  pickupLocation: {$first: "$pickupLocation"},
                  dropLocation: {$first: "$dropLocation"},
                  createdAt: {$first: "$createdAt"},
              }
            },
            {
              $project: {
                  _id: 0
              }
            },
            {$limit: 5},
        ])

        return res.status(200).json({
            error: false,
            msg: 'success',
            data: {
                recent_location: query?.saved_address === "true" ? undefined : latestTrip,
                saved_location: !!query._id ? addresses[0] : addresses
            }
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}


export const delSavedAddress = async (req, res) => {
    try {
        const {query} = req;
        await SavedAddress.deleteOne({_id: new mongoose.Types.ObjectId(query?._id)});
        return res.status(200).json({
            error: false,
            msg: 'deleted successful',
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}