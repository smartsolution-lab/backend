import Payment from '../models/payment.model';
import mongoose, {Schema} from "mongoose";
import User from '../models/user.model';
import {v4 as uuidv4} from 'uuid';
import Settings from "../models/settings.model";
import Wallet from "../models/wallet.model";
import crypto from 'crypto';
import TripRequest from "../models/trip_request.model";
import {getOrderDetails} from "../utils/paypal-api";
import createMollieClient from '@mollie/api-client';
import Razorpay from "razorpay";
import * as process from "process";
import DriverBalance from "../models/driver_balance.model";
import {getFlutterWaveTransaction} from "../utils/flutterwave";


// get Payment list
export const getPaymentList = async (req, res, next) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        let filter: any = {};
        if (query.search) {
            filter = {
                $or: [
                    {tran_id: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"user.email": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"user.phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"driver.phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"driver.phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const payments = await Payment.aggregatePaginate(Payment.aggregate([
            ...((!!user._id && user.role === 'user') ? [
                {
                    $match: {
                        "user": new mongoose.Types.ObjectId(user._id)
                    }
                },
            ] : []),
            ...((!!user._id && user.role === 'driver') ? [
                {
                    $match: {
                        driver: new mongoose.Types.ObjectId(user._id),
                    }
                },
            ] : []),
            {
                $lookup: {
                    from: 'users',
                    let: {'user': '$user'},
                    pipeline: [
                        {$match: {$expr: {$eq: ['$_id', '$$user']}}},
                        {$project: {name: 1, email: 1, image: 1, phone: 1, verified: 1}}
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'users',
                    let: {'driver': '$driver'},
                    pipeline: [
                        {$match: {$expr: {$eq: ['$_id', '$$driver']}}},
                        {$project: {name: 1, email: 1, image: 1, phone: 1, verified: 1}}
                    ],
                    as: 'driver'
                }
            },
            {$unwind: {path: '$driver', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'trip_requests',
                    let: {'trip': '$trip'},
                    pipeline: [
                        {$match: {$expr: {$eq: ['$_id', '$$trip']}}},
                        {
                            $project: {
                                pickupLocation: 1,
                                dropLocation: 1,
                                distance: 1,
                                date: 1,
                                time: 1,
                                total: 1,
                                status: 1,
                            }
                        }
                    ],
                    as: 'trip'
                }
            },
            {$unwind: {path: '$trip', preserveNullAndEmptyArrays: true}},
            {$match: filter},
        ]), {
            page: query.page || 1,
            limit: query.size || 15,
            sort: {createdAt: -1},
        });

        return res.status(200).json({
            error: false,
            data: payments
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

export const driverBalanceList = async (req, res) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        let filter: any = {};
        const roles = ['admin', 'driver']
        if (!roles.includes(user?.role)) {
            return res.status(403).json({
                error: true,
                msg: "Authentication failed"
            })
        }
        if (query.search) {
            filter = {
                $or: [
                    {trx_id: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"driver.email": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"driver.phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const balances = await DriverBalance.aggregatePaginate(Payment.aggregate([
            ...((!!user._id && user.role === 'admin') ? [
                {
                    $match: {}
                },
                {
                    $lookup: {
                        from: 'users',
                        let: {'driver': '$driver'},
                        pipeline: [
                            {$match: {$expr: {$eq: ['$_id', '$$driver']}}},
                            {$project: {name: 1, email: 1, image: 1, phone: 1, verified: 1}}
                        ],
                        as: 'driver'
                    }
                },
                {$unwind: {path: '$driver', preserveNullAndEmptyArrays: true}},
            ] : []),
            ...((!!user._id && user.role === 'driver') ? [
                {
                    $match: {
                        driver: new mongoose.Types.ObjectId(user._id),
                    }
                },
            ] : []),
            {
                $lookup: {
                    from: 'trip_requests',
                    let: {'trip': '$trip'},
                    pipeline: [
                        {$match: {$expr: {$eq: ['$_id', '$$trip']}}},
                        {
                            $project: {
                                pickupLocation: 1,
                                dropLocation: 1,
                                distance: 1,
                                subtotal: {$trunc: [{$ifNull: ["$subtotal", 0]}, 2]},
                                vat: 1,
                                total: {$trunc: [{$ifNull: ["$total", 0]}, 2]},
                                status: 1,
                                discount: 1,
                                payments: 1
                            }
                        }
                    ],
                    as: 'trip'
                }
            },
            {$unwind: {path: '$trip', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    driver: 1,
                    trip: 1,
                    earning_amount: {$trunc: [{$ifNull: ["$amount", 0]}, 2]},
                    createdAt: 1,
                    updatedAt: 1,
                }
            },
            {$match: filter},
        ]), {
            page: query.page || 1,
            limit: query.size || 15,
            sort: {createdAt: -1},
        });
        return res.status(200).json({
            error: false,
            data: balances
        });
    } catch (e) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

export const deleteDriverBalance = async (req, res) => {
    try {
        const {query} = req;
        await DriverBalance.findByIdAndDelete({_id: query?._id});
        return res.status(200).json({
            error: true,
            msg: 'driver balance deleted'
        });
    } catch (e) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

export const checkPayment = async (req, res) => {
    try {
        const {query} = req;
        const trip = await DriverBalance.findOne({trip: new mongoose.Types.ObjectId(query.trip)});
        let paymentStatus: boolean;
        paymentStatus = !!trip;
        return res.status(200).json({
            error: false,
            data: {
                payment: paymentStatus
            }
        });
    } catch (e) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

export const getPayment = async (req, res, next) => {
    try {
        const {query} = req;
        // @ts-ignore
        const payments = await Payment.aggregatePaginate(Payment.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(query._id)
                    }
                },
            ] : []),
            {
                $lookup: {
                    from: 'users',
                    let: {'user': '$user'},
                    pipeline: [
                        {$match: {$expr: {$eq: ['$_id', '$$user']}}},
                        {$project: {name: 1, email: 1, image: 1, phone: 1, verified: 1}}
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'users',
                    let: {'driver': '$driver'},
                    pipeline: [
                        {$match: {$expr: {$eq: ['$_id', '$$driver']}}},
                        {$project: {name: 1, email: 1, image: 1, phone: 1, verified: 1}}
                    ],
                    as: 'driver'
                }
            },
            {$unwind: {path: '$driver', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'trip_requests',
                    let: {'trip': '$trip'},
                    pipeline: [
                        {$match: {$expr: {$eq: ['$_id', '$$trip']}}},
                        {
                            $project: {
                                pickupLocation: 1,
                                dropLocation: 1,
                                distance: 1, date: 1,
                                time: 1,
                                total: 1,
                                status: 1,
                            }
                        }
                    ],
                    as: 'trip'
                }
            },
            {$unwind: {path: '$trip', preserveNullAndEmptyArrays: true}},
        ]), {
            page: query.page || 1,
            limit: query.size || 15,
            sort: {createdAt: -1},
        });

        return res.status(200).json({
            error: false,
            data: payments.docs[0]
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

// delete Payment
export const delPayment = async (req, res, next) => {
    try {
        const {query} = req;
        await Payment.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}


/**
 *
 * Payment Gateway
 *
 * **/
export const walletPayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const {user} = res.locals;
        const {body} = req;

        // @ts-ignore
        const userWallet = await Wallet.aggregate([
            {
                $match: {
                    user: user?._id
                }
            },
            {
                $group: {
                    _id: null,
                    user: {$first: "$user"},
                    balance: {$sum: "$amount"}
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    let: {"user": '$user'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ['$user', '$$user']},
                                        {$eq: ['$payment_method', 'wallet']},
                                        {$eq: ['$status', 'paid']},
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                user: {$first: "$user"},
                                totalPayment: {$sum: "$amount"}
                            }
                        },
                        {
                            $project: {
                                user: 1,
                                total: {$ifNull: ["$totalPayment", 0]}
                            }
                        }
                    ],
                    as: 'payments'
                }
            },
            {$unwind: {path: '$payments', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    user: 1,
                    currentBalance: {$ifNull: [{$subtract: ["$balance", "$payments.total"]}, "$balance"]}
                }
            }
        ])

        if ((Number(userWallet[0]?.currentBalance) >= Number(body.wallet_amount)) && (Number(userWallet[0]?.currentBalance) > 0)) {
            const transaction_id = crypto.randomBytes(4).toString('hex') + (new Date()).getTime();
            const trip = await TripRequest.findOne({_id: new mongoose.Types.ObjectId(body.trip_id)});
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
            const currentFareAmount = Number(trip?.total) - Number(paid)
            let paid_amount = Number(body.wallet_amount) > currentFareAmount ? currentFareAmount : Number(body.wallet_amount);
            const data = {
                fare: Number(trip?.total),
                due: (+currentFareAmount) - (+paid_amount),
                paid: Number(paid_amount),
                current_wallet_balance: Number((Number(userWallet[0]?.currentBalance) - Number(paid_amount)).toFixed(2))
            }
            const payment = await Payment.create([{
                user: user?._id,
                driver: trip?.driver,
                trip: trip?._id,
                payment_method: 'wallet',
                status: 'paid',
                tran_id: transaction_id,
                amount: paid_amount,
            }], {session})
            const latestTripData = await TripRequest.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: payment[0]?._id,
                        method: "wallet",
                        amount: payment[0]?.amount
                    },
                },
            }, {session, new: true});
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
            if ((payment[0]?.amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await DriverBalance.create([{
                    driver: trip?.driver,
                    trip: trip?._id,
                    amount: +trip?.subtotal
                }], {session})
            }

            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // socket event to the driver
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }

            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            })
        }
        return res.status(400).json({
            error: true,
            msg: 'You have no enough balance',
            data: userWallet
        })
    } catch (e) {
        console.log(e)
        await session.abortTransaction();
        return res.status(500).json({
            error: true,
            msg: "Transaction Failed"
        })
    } finally {
        await session.endSession();
    }
}

/**
 * stripe payment
 * */
export const stripePayment = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const {tripInfo, token} = req.body;
        const {user} = res.locals;
        if (!user?._id) {
            return res.status(200).json({
                status: true,
                message: 'Authorization Failed!'
            })
        }

        const settings = await Settings.findOne({});
        const stripe = require("stripe")(`${process.env.STRIPE_SECRET}`);

        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id,
        });

        const idempotencyKey = uuidv4();
        const charge = await stripe.charges.create(
            {
                amount: Math.round(tripInfo?.amount * 100),
                currency: `${tripInfo?.countryCurrency.toLowerCase()}`,
                customer: customer.id,
                receipt_email: token.email,
                description: `${tripInfo.description}`,
                shipping: {
                    name: token.card.name,
                    address: {
                        line1: token.card.address_line1,
                        line2: token.card.address_line2,
                        city: token.card.address_country,
                        postal_code: token.card.address_zip,
                    },
                },
            },
            {
                idempotencyKey
            }
        );
        if (charge?.paid === true) {
            const transaction_id = crypto.randomBytes(4).toString('hex') + (new Date()).getTime();
            const trip = await TripRequest.findOne({_id: new mongoose.Types.ObjectId(tripInfo?._id)});
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
            const currentFareAmount = Number(trip?.total) - Number(paid)
            let paid_amount = Number(tripInfo?.amount) > currentFareAmount ? currentFareAmount : Number(tripInfo?.amount);
            const data = {
                fare: Number(trip?.total),
                due: (+currentFareAmount) - (+paid_amount),
                paid: Number(paid_amount),
            }
            const payment = await Payment.create([{
                user: user?._id,
                driver: trip?.driver,
                trip: trip?._id,
                payment_method: 'stripe',
                status: 'paid',
                tran_id: transaction_id,
                amount: +paid_amount,
            }], {session})
            const latestTripData = await TripRequest.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: payment[0]?._id,
                        method: "stripe",
                        amount: payment[0]?.amount
                    },
                },
            }, {session, new: true});
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            if ((payment[0]?.amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await DriverBalance.create([{
                    driver: trip?.driver,
                    trip: trip?._id,
                    amount: +trip?.subtotal
                }], {session})
            }

            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }
            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            })
        }
        await session.commitTransaction();
        return res.status(200).json({
            status: true,
            message: 'Payment Failed'
        })
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            status: false,
            msg: "Transaction Failed"
        })
    } finally {
        await session.endSession();
    }
}

/**
 * paypal payment
 * */
export const paypalPayment = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const {details, tripInfo} = req.body;
        const {user} = res.locals;
        if (!user?._id) {
            return res.status(200).json({
                status: true,
                message: 'Authorization Failed!'
            })
        }
        const paypalOrder = await getOrderDetails(details?.orderID);
        if ((paypalOrder?.status === 'COMPLETED') && (details?.orderID === paypalOrder?.id)) {
            const transaction_id = crypto.randomBytes(4).toString('hex') + (new Date()).getTime();
            const trip = await TripRequest.findOne({_id: new mongoose.Types.ObjectId(tripInfo?._id)});
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
            const currentFareAmount = Number(trip?.total) - Number(paid)
            let paid_amount = Number(paypalOrder.purchase_units[0].amount.value) > currentFareAmount ? currentFareAmount : Number(paypalOrder.purchase_units[0].amount.value);
            const data = {
                fare: Number(trip?.total),
                due: (Number(currentFareAmount) - Number(paid_amount)),
                paid: Number(paid_amount),
            }
            const payment = await Payment.create([{
                user: user?._id,
                driver: trip?.driver,
                trip: trip?._id,
                payment_method: 'paypal',
                status: 'paid',
                tran_id: transaction_id,
                amount: Number(paid_amount),
            }], {session})
            const latestTripData = await TripRequest.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: payment[0]?._id,
                        method: "paypal",
                        amount: payment[0]?.amount
                    },
                },
            }, {session, new: true});
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
            if ((payment[0]?.amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await DriverBalance.create([{
                    driver: trip?.driver,
                    trip: trip?._id,
                    amount: +trip?.subtotal
                }], {session})
            }

            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }
            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            })
        } else {
            await session.abortTransaction();
            return res.status(400).json({
                error: true,
                msg: 'Payment Failed'
            })
        }
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    } finally {
        await session.endSession();
    }
}

/**
 * Mollie Payment
 * */
export const molliePaymentGetaway = async (req, res, next) => {
    try {
        const orderId = uuidv4();
        const url = `${req.protocol}://${req.get('host')}/`;

        const transaction_id = crypto.randomBytes(4).toString('hex') + (new Date()).getTime();
        const trip = await TripRequest.findById(req.body.trip_id);
        // @ts-ignore
        const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
        const currentFareAmount = Number(trip?.total) - Number(paid)
        let paid_amount = Number(req.body.price) > currentFareAmount ? currentFareAmount : Number(req.body.price);

        // @ts-ignore
        const setAmount = `${parseFloat(Number(paid_amount)).toFixed(2)}`;

        const envFileData = await Settings.findOne({});
        const mollieClient = createMollieClient({apiKey: process.env.mollie_live_api_key});

        const payment = await mollieClient.payments.create({
            amount: {value: setAmount, currency: 'EUR'},
            description: req.body.description,
            redirectUrl: `${url}api/payment/webhook?id=${orderId}`,
            metadata: {orderId},
        });
        // Redirect the consumer to complete the payment using `payment.getPaymentUrl()`.
        // save info into the database
        await Payment.create(
            {
                user: res.locals.user._id,
                driver: trip?.driver,
                trip: trip?._id,
                payment_method: 'mollie',
                status: 'pending',
                tran_id: transaction_id,
                amount: setAmount,
                payment
            }
        )
        return res.send(payment.getPaymentUrl());
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server failed"
        })
    }
}

// mollie payment check
export const molliePaymentCheck = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        // fetch data from orderId
        const findPayment = await Payment.findOne({"payment.metadata.orderId": req.query.id});
        if (!findPayment) return res.status(400).json({status: false, message: "Sorry! Payment Failed..."});

        const envFileData = await Settings.findOne({});
        const mollieClient = createMollieClient({apiKey: process.env.mollie_live_api_key});

        // check payment by id
        const payment = await mollieClient.payments.get(findPayment.payment.id);
        if (payment.isPaid()) {
            // Hooray, you've received a payment! You can start shipping to the consumer.
            const trip = await TripRequest.findOne({_id: findPayment.trip});
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
            const currentFareAmount = Number(trip?.total) - Number(paid)
            let paid_amount = Number(findPayment.amount) > currentFareAmount ? currentFareAmount : Number(findPayment.amount);
            const data = {
                fare: Number(trip?.total),
                due: (Number(currentFareAmount) - Number(paid_amount)),
                paid: Number(paid_amount),
            }
            const payment = await Payment.findByIdAndUpdate({_id: findPayment._id}, {status: 'paid'}, {
                new: true,
                session
            });
            const latestTripData = await TripRequest.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: findPayment._id,
                        method: "mollie",
                        amount: Number(findPayment.amount)
                    },
                }
            }, {session, new: true});
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
            if ((payment?.amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await DriverBalance.create([{
                    driver: trip?.driver,
                    trip: trip?._id,
                    amount: +trip?.subtotal
                }], {session})
            }

            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }
            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            })
        } else if (!payment.isOpen()) {
            // The payment isn't paid and has expired. We can assume it was aborted.
            return res.status(400).json({
                status: false,
                message: 'Payment time out or canceled!',
            });
        }
        return res.status(400).json({
            status: false,
            message: 'Payment Failed',
            payment
        });
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    } finally {
        await session.endSession();
    }
}

/**
 * RazorPay Payment
 * */
export const razorPayPayment = async (req, res) => {
    try {
        const envFileData = await Settings.findOne({});
        const instance = new Razorpay({
            key_id: process.env.razorpay_client_id,
            key_secret: process.env.razorpay_secret_key,
        });
        const options = {
            // @ts-ignore
            amount: parseInt(req.body.amount * 100),
            currency: req.body?.currency,
            receipt: crypto.randomBytes(10).toString("hex"),
        };
        instance.orders.create(options, (error, order) => {
            if (error) {
                return res.status(500).json({error: true, msg: "Something Went Wrong!"});
            }
            return res.status(200).json({data: order});
        });
    } catch (error) {
        return res.status(500).json({msg: "Internal Server Error!"});
    }
}

export const razorPayVerification = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const {product} = req.body;
        const envFileData = await Settings.findOne({});
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body.response;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.razorpay_secret_key)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const transaction_id = crypto.randomBytes(4).toString('hex') + (new Date()).getTime();
            const trip = await TripRequest.findOne({_id: new mongoose.Types.ObjectId(product?.trip_id)});
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
            const currentFareAmount = Number(trip?.total) - Number(paid)
            let paid_amount = Number(product.amount) > currentFareAmount ? currentFareAmount : Number(product.amount);
            const data = {
                fare: Number(trip?.total),
                due: (Number(currentFareAmount) - Number(paid_amount)),
                paid: Number(paid_amount),
            }
            const payment = await Payment.create([{
                user: res.locals.user._id,
                driver: trip?.driver,
                trip: trip?._id,
                payment_method: 'razorpay',
                status: 'paid',
                tran_id: transaction_id,
                amount: Number(paid_amount),
            }], {session})
            const latestTripData = await TripRequest.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: payment[0]?._id,
                        method: "razorpay",
                        amount: payment[0]?.amount
                    },
                }
            }, {session, new: true});
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
            if ((payment[0].amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await DriverBalance.create([{
                    driver: trip?.driver,
                    trip: trip?._id,
                    amount: +trip?.subtotal
                }], {session})
            }

            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }
            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            })
        } else {
            await session.abortTransaction();
            return res.status(400).json({error: true, msg: "Invalid signature sent!"});
        }
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({error: true, msg: "Internal Server Error!"});
    } finally {
        await session.endSession();
    }
}

// Flutter-wave payment
export const flutterWavePayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const {user} = res.locals;
        const {transactionId, tripId, countryCurrency, amount, tx_ref} = req.body;

        const payment_response = await getFlutterWaveTransaction(transactionId);

        if(payment_response?.status === 'success' && payment_response?.data?.tx_ref === tx_ref) {
            const transaction_id = crypto.randomBytes(4).toString('hex') + (new Date()).getTime();
            const trip = await TripRequest.findOne({_id: new mongoose.Types.ObjectId(tripId)});
            // @ts-ignore
            const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
            const currentFareAmount = Number(trip?.total) - Number(paid)
            let paid_amount = Number(payment_response?.data?.amount) > currentFareAmount ? currentFareAmount : Number(payment_response?.data?.amount);
            const data = {
                fare: Number(trip?.total),
                due: (+currentFareAmount) - (+paid_amount),
                paid: Number(paid_amount),
            }
            const payment = await Payment.create([{
                user: user?._id,
                driver: trip?.driver,
                trip: trip?._id,
                payment_method: 'flutterwave',
                status: 'paid',
                tran_id: transaction_id,
                amount: +paid_amount,
            }], {session})
            const latestTripData = await TripRequest.findByIdAndUpdate(trip?._id, {
                $push: {
                    payments: {
                        _id: payment[0]?._id,
                        method: "flutterwave",
                        amount: payment[0]?.amount
                    },
                },
            }, {session, new: true});
            // @ts-ignore
            const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0);
            if ((payment[0]?.amount >= trip?.total) || (paidCalculation >= trip?.total)) {
                await DriverBalance.create([{
                    driver: trip?.driver,
                    trip: trip?._id,
                    amount: +trip?.subtotal
                }], {session})
            }

            await session.commitTransaction();
            for (let socket_id of Object.keys(socketIds)) {
                // @ts-ignore
                if (socketIds[socket_id] === trip?.driver?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
                // socket event to the user
                // @ts-ignore
                if (socketIds[socket_id] === trip?.user?.toString()) {
                    const getTrip = await getTripInformation(trip?._id);
                    await io.to(socket_id).emit('payment_received', getTrip);
                }
            }
            return res.status(200).json({
                error: false,
                msg: 'Payment Successful',
                data
            })
        }
        await session.commitTransaction();
        return res.status(200).json({
            status: true,
            message: 'Payment Failed'
        })
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            status: false,
            msg: "Transaction Failed"
        })
    } finally {
        await session.endSession();
    }
}



/**
 *
 * */
// payment
const paymentWorker = async ({trip_id, user_amount, userWallet, user, payment_method, session}) => {
    const transaction_id = crypto.randomBytes(4).toString('hex') + (new Date()).getTime();
    const trip = await TripRequest.findOne({_id: new mongoose.Types.ObjectId(trip_id)});
    // @ts-ignore
    const paid = trip?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
    const currentFareAmount = Number(trip?.total) - Number(paid)
    let paid_amount = Number(user_amount) > currentFareAmount ? currentFareAmount : Number(user_amount);
    const data = userWallet ? {
            fare: Number(trip?.total),
            due: (+currentFareAmount) - (+paid_amount),
            paid: Number(paid_amount),
            current_wallet_balance: Number((Number(userWallet[0]?.currentBalance) - Number(paid_amount)).toFixed(2))
        } :
        {
            fare: Number(trip?.total),
            due: (+currentFareAmount) - (+paid_amount),
            paid: Number(paid_amount),
        }
    const payment = await Payment.create([{
        user: user?._id,
        driver: trip?.driver,
        trip: trip?._id,
        payment_method: payment_method,
        status: 'paid',
        tran_id: transaction_id,
        amount: paid_amount,
    }], {session})
    const latestTripData = await TripRequest.findByIdAndUpdate(trip?._id, {
        $push: {
            payments: {
                _id: payment[0]?._id,
                method: payment_method,
                amount: payment[0]?.amount
            },
        },
    }, {session, new: true});
    // @ts-ignore
    const paidCalculation = latestTripData?.payments?.reduce((cc, cv) => (cc = cc + cv?.amount), 0)
    if ((payment[0].amount >= trip?.total) || (paidCalculation >= trip?.total)) {
        await DriverBalance.create([{
            driver: trip?.driver,
            trip: trip?._id,
            amount: +trip?.subtotal
        }], {session})
    }

    return data;
}


// get one trip details
const getTripInformation = async (trip_id) => {
    const trip = await TripRequest.aggregate([
        {
            $match: {
                _id: trip_id
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
            $lookup: {
                from: 'driver_ratings',
                let: {"trip": "$_id"},
                pipeline: [
                    {
                        $match: {
                            $expr: {$eq: ["$trip", "$$trip"]}
                        }
                    },
                ],
                as: 'rating'
            }
        },
        {$unwind: {path: '$rating', preserveNullAndEmptyArrays: true}},
        {
            $project: {
                user: 1,
                driver: 1,
                rating: 1,
                pickupLocation: 1,
                dropLocation: 1,
                distance: 1,
                subtotal: 1,
                vat: 1,
                total: 1,
                discount: 1,
                payment_method: 1,
                payments: 1,
                paid: {
                    $reduce: {
                        input: "$payments",
                        initialValue: 0,
                        in: {
                            $add: ["$$value", "$$this.amount"]
                        }
                    }
                },
                vehicle: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                due: {
                    $round: [
                        {
                            $subtract: ["$total", {
                                $reduce: {
                                    input: "$payments",
                                    initialValue: 0,
                                    in: {
                                        $add: ["$$value", "$$this.amount"]
                                    }
                                }
                            }]
                        }, 2]
                },
            }
        },
    ]);
    return trip[0];
}