"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delBooking = exports.getBooking = exports.getBookingList = exports.bookingConfirmation = exports.bookingRequestUpdateByDriver = exports.postBooking = void 0;
const booking_model_1 = __importDefault(require("../models/booking.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const userEmailSend_1 = require("../utils/userEmailSend");
// post Booking
const postBooking = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { body } = req;
        const { user } = res.locals;
        delete body._id;
        const newBooking = await booking_model_1.default.create({ ...body });
        const booking = await booking_model_1.default.aggregate([
            {
                $match: { _id: newBooking?._id }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { "user": "$user" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$user"] } } },
                        { $project: { _id: 1, name: 1, email: 1, phone: 1, image: 1 } }
                    ],
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    let: { "driver": "$driver" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$driver"] } } },
                        { $project: { _id: 1, name: 1, email: 1, phone: 1, image: 1 } }
                    ],
                    as: 'driver'
                }
            },
            { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
        ]);
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
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.postBooking = postBooking;
// update ride by driver
const bookingRequestUpdateByDriver = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { body } = req;
        const { user } = res.locals;
        const updatedBookingRequest = await booking_model_1.default.findByIdAndUpdate(body._id, { $set: body }, {
            new: true,
            runValidators: true
        })
            .populate('driver', 'name email phone image')
            .populate('user', 'name email phone image')
            .populate('vehicle', 'name model_name images');
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
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.bookingRequestUpdateByDriver = bookingRequestUpdateByDriver;
// booking confirmation by admin
const bookingConfirmation = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { body } = req;
        const { user } = res.locals;
        const bookingConfirmation = await booking_model_1.default.findByIdAndUpdate(body._id, { $set: body }, {
            new: true,
            runValidators: true
        })
            .populate('driver', 'name email phone image')
            .populate('user', 'name email phone image')
            .populate('vehicle', 'name model_name images');
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
                emails[i]?.name} ! <br/>
                    Your booking has been approved. Please check your booking list for more details. 
                    <div style="border-radius: 5px; background-color: rgba(0,0,0, .1); padding: 10px; margin: 30px 0px">
                        <h3 style="text-align: center;">Contact Information</h3>
                        <p style="text-align: center;">Name: ${
                // @ts-ignore
                i === 0 ? emails[i + 1]?.name : emails[i - 1]?.name}
                        </p>
                        <p style="text-align: center;">Phone: ${
                // @ts-ignore
                i === 0 ? emails[i + 1]?.phone : emails[i - 1]?.phone}
                        </p>
                        <p style="text-align: center;">Email: ${
                // @ts-ignore
                i === 0 ? emails[i + 1]?.email : emails[i - 1]?.email}
                        </p>
                    </div>
                `,
            };
            await (0, userEmailSend_1.sendUserEmailGeneral)(data);
        }
        return res.status(200).json({
            error: false,
            msg: 'Booking successfully confirmed',
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.bookingConfirmation = bookingConfirmation;
// get Bookings
const getBookingList = async (req, res, next) => {
    try {
        const { query } = req;
        const { user } = res.locals;
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { "user.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "user.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "driver.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "user.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const booking = await booking_model_1.default.aggregatePaginate(booking_model_1.default.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
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
                    let: { "user": "$user" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$user"] } } },
                        { $project: { _id: 1, name: 1, email: 1, phone: 1, image: 1 } }
                    ],
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    let: { "driver": "$driver" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$driver"] } } },
                        { $project: { _id: 1, name: 1, email: 1, phone: 1, image: 1 } }
                    ],
                    as: 'driver'
                }
            },
            { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
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
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ]));
        return res.status(200).json({
            error: false,
            data: booking
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.getBookingList = getBookingList;
// get Booking
const getBooking = async (req, res, next) => {
    try {
        const { query } = req;
        // @ts-ignore
        const booking = await booking_model_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(query._id)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { "user": "$user" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$user"] } } },
                        { $project: { _id: 1, name: 1, email: 1, phone: 1, image: 1 } }
                    ],
                    as: 'user'
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    let: { "driver": "$driver" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$driver"] } } },
                        { $project: { _id: 1, name: 1, email: 1, phone: 1, image: 1 } }
                    ],
                    as: 'driver'
                }
            },
            { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
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
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.getBooking = getBooking;
// delete Booking
const delBooking = async (req, res, next) => {
    try {
        const { query } = req;
        await booking_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Booking Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        });
    }
};
exports.delBooking = delBooking;
//# sourceMappingURL=booking.controller.js.map