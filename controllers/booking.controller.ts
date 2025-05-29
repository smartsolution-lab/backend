import Booking from '../models/booking.model';
import mongoose from "mongoose";
import TripRequest from "../models/trip_request.model";
import {sendUserEmailGeneral} from "../utils/userEmailSend";

// post Booking
export const postBooking = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const {body} = req;
        const {user} = res.locals;

        delete body._id;
        const newBooking = await Booking.create({...body});

        const booking = await Booking.aggregate([
            {
                $match: {_id: newBooking?._id}
            },
            {
                $lookup: {
                    from: 'users',
                    let: {"user": "$user"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$user"]}}},
                        {$project: {_id: 1, name: 1, email: 1, phone: 1, image: 1}}
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'users',
                    let: {"driver": "$driver"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$driver"]}}},
                        {$project: {_id: 1, name: 1, email: 1, phone: 1, image: 1}}
                    ],
                    as: 'driver'
                }
            },
            {$unwind: {path: '$driver', preserveNullAndEmptyArrays: true}},
        ])

        for (let socket_id of Object.keys(socketIds)) {
            // @ts-ignore
            if (socketIds[socket_id] === booking[0]?.driver?._id?.toString()) {
                await io.to(socket_id).emit('user_booking_req', booking[0]);
            }
        }

        return res.status(200).json({
            error: false,
            msg: 'Booking request successful',
            data: booking[0]
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}

// update ride by driver
export const bookingRequestUpdateByDriver = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const {body} = req;
        const {user} = res.locals;

        const updatedBookingRequest = await Booking.findByIdAndUpdate(body._id, {$set: body}, {
            new: true,
            runValidators: true
        })
            .populate('driver', 'name email phone image')
            .populate('user', 'name email phone image')
            .populate('vehicle', 'name model_name images')

        for (let socket_id of Object.keys(socketIds)) {
            // @ts-ignore
            if (socketIds[socket_id] === updatedBookingRequest?.user?._id?.toString()) {
                await io.to(socket_id).emit('driver_booking_res', updatedBookingRequest);
            }
        }
        return res.status(200).json({
            error: false,
            msg: 'Successfully updated',
            data: updatedBookingRequest
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}

// booking confirmation by admin
export const bookingConfirmation = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const {body} = req;
        const {user} = res.locals;

        const bookingConfirmation = await Booking.findByIdAndUpdate(body._id, {$set: body}, {
            new: true,
            runValidators: true
        })
            .populate('driver', 'name email phone image')
            .populate('user', 'name email phone image')
            .populate('vehicle', 'name model_name images')

        for (let socket_id of Object.keys(socketIds)) {
            // @ts-ignore
            if (socketIds[socket_id] === bookingConfirmation?.driver?._id?.toString()) {
                await io.to(socket_id).emit('booking_confirmation', bookingConfirmation);
            }
        }
        for (let socket_id of Object.keys(socketIds)) {
            // @ts-ignore
            if (socketIds[socket_id] === bookingConfirmation?.user?._id?.toString()) {
                await io.to(socket_id).emit('booking_confirmation', bookingConfirmation);
            }
        }


        const userEmail = bookingConfirmation?.user;
        const driverEmail = bookingConfirmation?.driver;

        const emails = [userEmail, driverEmail];

        for (let i = 0; i < emails?.length; i++) {
            const data = {
                // @ts-ignore
                email: emails[i]?.email,
                subject: "Booking confirmation message",
                message: `
                    Hello, ${
                    // @ts-ignore
                    emails[i]?.name
                } ! <br/>
                    Your booking has been approved. Please check your booking list for more details. 
                    <div style="border-radius: 5px; background-color: rgba(0,0,0, .1); padding: 10px; margin: 30px 0px">
                        <h3 style="text-align: center;">Contact Information</h3>
                        <p style="text-align: center;">Name: ${
                    // @ts-ignore
                    i === 0 ? emails[i + 1]?.name : emails[i - 1]?.name
                }
                        </p>
                        <p style="text-align: center;">Phone: ${
                    // @ts-ignore
                    i === 0 ? emails[i + 1]?.phone : emails[i - 1]?.phone
                }
                        </p>
                        <p style="text-align: center;">Email: ${
                    // @ts-ignore
                    i === 0 ? emails[i + 1]?.email : emails[i - 1]?.email
                }
                        </p>
                    </div>
                `,
            }
            await sendUserEmailGeneral(data);
        }

        return res.status(200).json({
            error: false,
            msg: 'Booking successfully confirmed',
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}

// get Bookings
export const getBookingList = async (req, res, next) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        let filter: any = {};
        if (query.search) {
            filter = {
                $or: [
                    {"user.email": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"user.phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"driver.email": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"user.phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const booking = await Booking.aggregatePaginate(Booking.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            ...((user?.role === 'user') ? [
                {
                    $match: {
                        user: user?._id
                    }
                },
            ] : []),
            ...((user?.role === 'driver') ? [
                {
                    $match: {
                        driver: user?._id
                    }
                },
            ] : []),
            {
                $lookup: {
                    from: 'users',
                    let: {"user": "$user"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$user"]}}},
                        {$project: {_id: 1, name: 1, email: 1, phone: 1, image: 1}}
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'users',
                    let: {"driver": "$driver"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$driver"]}}},
                        {$project: {_id: 1, name: 1, email: 1, phone: 1, image: 1}}
                    ],
                    as: 'driver'
                }
            },
            {$unwind: {path: '$driver', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    isExpired: {
                        $cond: {
                            if: { $gt: ["$time", new Date()] },
                            then: false,
                            else: true
                        }
                    },
                    user: 1,
                    driver: 1,
                    pickupLocation: 1,
                    dropLocation: 1,
                    distance: 1,
                    subtotal: 1,
                    vat: 1,
                    total: 1,
                    discount: 1,
                    payment_method: 1,
                    vehicle: 1,
                    status: 1,
                    date: 1,
                    time: 1,
                    createdAt: 1,
                    updatedAt: 1,
                }
            },
            {$match: filter},
            {$sort: {createdAt: -1}}
        ]));
        return res.status(200).json({
            error: false,
            data: booking
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}

// get Booking
export const getBooking = async (req, res, next) => {
    try {
        const {query} = req;
        // @ts-ignore
        const booking = await Booking.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(query._id)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: {"user": "$user"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$user"]}}},
                        {$project: {_id: 1, name: 1, email: 1, phone: 1, image: 1}}
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'users',
                    let: {"driver": "$driver"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$_id", "$$driver"]}}},
                        {$project: {_id: 1, name: 1, email: 1, phone: 1, image: 1}}
                    ],
                    as: 'driver'
                }
            },
            {$unwind: {path: '$driver', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    isExpired: {
                        $cond: {
                            if: { $gt: ["$time", new Date()] },
                            then: false,
                            else: true
                        }
                    },
                    user: 1,
                    driver: 1,
                    pickupLocation: 1,
                    dropLocation: 1,
                    distance: 1,
                    subtotal: 1,
                    vat: 1,
                    total: 1,
                    discount: 1,
                    payment_method: 1,
                    vehicle: 1,
                    status: 1,
                    date: 1,
                    time: 1,
                    createdAt: 1,
                    updatedAt: 1,
                }
            },
        ]);
        return res.status(200).json({
            error: false,
            data: booking[0]
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}

// delete Booking
export const delBooking = async (req, res, next) => {
    try {
        const {query} = req;
        await Booking.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Booking Deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}