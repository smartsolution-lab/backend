import Wallet from '../models/wallet.model';
import mongoose from "mongoose";
import {v4 as uuidv4} from 'uuid';
import Settings from "../models/settings.model";
import {getOrderDetails} from "../utils/paypal-api";
import Payment from "../models/payment.model";
import {getFlutterWaveTransaction} from "../utils/flutterwave";


// Flutter-wave payment
export const flutterWaveWallet = async (req, res) => {
    try {
        const {user} = res.locals;
        const {transactionId, tx_ref} = req.body;
        const payment_response = await getFlutterWaveTransaction(transactionId);
        if(payment_response?.status === 'success' && payment_response?.data?.tx_ref === tx_ref) {
            await Wallet.create({
                        user: user._id,
                        amount: payment_response?.data?.charged_amount,
                        deposit_method: "flutterwave"
                    })

            return res.status(200).json({
                error: false,
                msg: 'Deposit successful, thanks'
            })
        }
        return res.status(400).json({
            error: true,
            msg: 'Deposit Failed, please try again'
        })
    } catch (error) {
        return res.status(500).json({msg: "Internal Server Error!"});
    }
}


// Stripe Wallet
export const stripeWallet = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {deposit, token} = req.body;
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
                amount: Math.round(deposit?.amount * 100),
                currency: `${deposit?.countryCurrency.toLowerCase()}`,
                customer: customer.id,
                receipt_email: token.email,
                description: `${deposit.description}`,
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
            await Wallet.create(
                [
                    {
                        user: user._id,
                        amount: deposit?.amount,
                        deposit_method: "Stripe"
                    }
                ], {session})

            await session.commitTransaction();
            return res.status(200).json({
                error: false,
                msg: 'Deposit successful, thanks'
            })
        }

        return res.status(400).json({
            error: true,
            msg: 'Deposit Failed'
        })

    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({
            error: true,
            msg: "Transaction Failed"
        })
    } finally {
        await session.endSession();
    }
}

// paypal Wallet
export const paypalWallet = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {details, amount} = req.body;
        const {user} = res.locals;
        const paypalOrder = await getOrderDetails(details?.orderID);
        if ((paypalOrder?.status === 'COMPLETED') && (details?.orderID === paypalOrder?.id)) {
            await Wallet.create(
                [
                    {
                        user: user._id,
                        amount: +paypalOrder.purchase_units[0].amount.value,
                        deposit_method: "paypal"
                    }
                ], {session})
            await session.commitTransaction();
            return res.status(200).json({
                error: false,
                msg: 'Deposit successful, thanks',
            })
        } else {
            await session.abortTransaction();
            return res.status(400).json({
                error: true,
                msg: 'Deposit Failed'
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

// user wise Wallets fetch
export const getWalletList = async (req, res, next) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        let filter: any = {};
        if (query.search) {
            filter = {
                $or: [
                    {"amount": query.search},
                    {"deposit_method": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const balances = await Wallet.aggregatePaginate(Wallet.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(user._id)
                }
            },
            {$match: filter},
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        });

        return res.status(200).json({
            error: false,
            data: balances
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Internal server error!"
        })
    }
}

export const getWalletDepositList = async (req, res, next) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        let filter: any = {};
        if (!!query.search) {
            filter = {
                $or: [
                    {"amount": query.search},
                    {"deposit_method": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const balances = await Wallet.aggregatePaginate(Wallet.aggregate([
            {
                $lookup: {
                    from: "users",
                    let: {"user": "$user"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$user"]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                image: 1,
                                phone: 1
                            }
                        }
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {$match: filter},
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        });

        return res.status(200).json({
            error: false,
            data: balances
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Internal server error!"
        })
    }
}

// user wise Wallets fetch for app
export const getWalletListApp = async (req, res, next) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        let filter: any = {};
        if (query.search) {
            filter = {
                $or: [
                    {"amount": query.search},
                    {"deposit_method": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const balances = await Wallet.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(user._id)
                }
            },
            {$match: filter},
        ]);

        return res.status(200).json({
            error: false,
            data: {balances}
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Internal server error!"
        })
    }
}

// user wise Wallets transactions
export const getWalletTransactions = async (req, res, next) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        let filter: any = {};
        if (query.search) {
            filter = {
                $or: [
                    {"amount": query.search},
                    {"deposit_method": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const transactions = await Payment.aggregatePaginate(Payment.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(user._id),
                    payment_method: "wallet",
                    status: 'paid',
                    amount: {$gt: 0},
                }
            },
            {
                $lookup: {
                    from: 'trip_requests',
                    let: {'trip': '$trip'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$trip']
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'vehicles',
                                let: {'vehicle': '$vehicle'},
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$_id', '$$vehicle']
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            name: 1,
                                            model_name: 1,
                                            images: 1,
                                        }
                                    }
                                ],
                                as: 'vehicle'
                            }
                        },
                        {$unwind: {path: '$vehicle', preserveNullAndEmptyArrays: true}},
                        {
                            $project: {
                                _id: 1,
                                pickupLocation: 1,
                                dropLocation: 1,
                                distance: 1,
                                subtotal: 1,
                                total: 1,
                                coupon: 1,
                                vehicle: 1,
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
            limit: query.size || 10,
            sort: {createdAt: -1},
        });
        return res.status(200).json({
            error: false,
            data: transactions
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Internal server error!"
        })
    }
}

// user wise Wallets transactions
export const getWalletTransactionsApp = async (req, res, next) => {
    try {
        const {query} = req;
        const {user} = res.locals;
        let filter: any = {};
        if (query.search) {
            filter = {
                $or: [
                    {"amount": query.search},
                    {"deposit_method": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const transactions = await Payment.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            {user: new mongoose.Types.ObjectId(user._id)},
                            {$eq: ['$payment_method', 'wallet']},
                            {$eq: ['$status', 'paid']},
                            {$gt: ["$amount", 0]},
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'trip_requests',
                    let: {'trip': '$trip'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$trip']
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'vehicles',
                                let: {'vehicle': '$vehicle'},
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$_id', '$$vehicle']
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            name: 1,
                                            model_name: 1,
                                            images: 1,
                                        }
                                    }
                                ],
                                as: 'vehicle'
                            }
                        },
                        {$unwind: {path: '$vehicle', preserveNullAndEmptyArrays: true}},
                        {
                            $project: {
                                _id: 1,
                                pickupLocation: 1,
                                dropLocation: 1,
                                distance: 1,
                                subtotal: 1,
                                total: 1,
                                coupon: 1,
                                vehicle: 1,
                            }
                        }
                    ],
                    as: 'trip'
                }
            },
            {$unwind: {path: '$trip', preserveNullAndEmptyArrays: true}},
            {$match: filter},
        ]);
        return res.status(200).json({
            error: false,
            data: {transactions}
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Internal server error!"
        })
    }
}

// user's wallet short brief
export const getUserWalletShortInfo = async (req, res, next) => {
    try {
        const {user} = res.locals;
        // @ts-ignore
        const balance = await Wallet.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(user._id)
                }
            },
            {
                $group: {
                    _id: {
                        user: '$user'
                    },
                    user: {$first: "$user"},
                    deposits: {$sum: "$amount"}
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    let: {'user': '$user'},
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
                                total: {$sum: "$amount"}
                            }
                        },
                    ],
                    as: 'spent'
                }
            },
            {$unwind: {path: '$spent', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    _id: 0,
                    deposits: {$ifNull: ["$deposits", 0]},
                    spent: {$ifNull: ["$spent.total", 0]},
                    currentBalance: {$ifNull: [{$subtract: ["$deposits", "$spent.total"]}, "$deposits"]}
                }
            }
        ]);

        return res.status(200).json({
            error: false,
            data: {...balance[0]}
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}

// delete Wallet
export const delWallet = async (req, res, next) => {
    try {
        const {query} = req;
        await Wallet.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Wallet Deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}