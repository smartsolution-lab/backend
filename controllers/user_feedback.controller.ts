import UserFeedback from '../models/user_feedback.model';
import mongoose from "mongoose";

// post UserFeedback
export const postUserFeedback = async (req, res, next) => {
    try {
        const {body} = req;
        const {user} = res.locals;
        const isExist = await UserFeedback.findOne({user: new mongoose.Types.ObjectId(user._id)});
        if (!!isExist) {
            return res.status(200).json({
                error: true,
                msg: 'Already submitted!',
            })
        }
        const user_response = await UserFeedback.create({
            user: user._id,
            comment: body.comment,
            rating: +body.rating,
        });
        return res.status(200).json({
            error: false,
            msg: 'Successfully created!',
            data: user_response
        })
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({
                error: true,
                msg: 'Duplicate warning!'
            })
        }
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

// update UserFeedback
export const updateUserFeedback = async (req, res, next) => {
    try {
        const {body} = req;
        await UserFeedback.findByIdAndUpdate(body._id, {$set: body});
        return res.status(200).json({
            error: false,
            msg: 'Successfully updated'
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

export const getUserFeedbacks = async (req, res, next) => {
    try {
        const {query} = req;
        let filter: any = {};
        if (query.search) {
            filter = {
                $or: [
                    {"user.name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"user.email": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"user.phone": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                    {"rating": +query.search},
                ]
            }
        }
        // @ts-ignore
        const feedbacks = await UserFeedback.aggregatePaginate(UserFeedback.aggregate([
            {
                $lookup: {
                    from: 'users',
                    let: {'user': '$user'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$user'],
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                phone: 1,
                                image: 1,
                            }
                        },
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {$match: filter},
            {$sort: {createdAt: -1}}
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
        });
        return res.status(200).json({
            error: false,
            data: feedbacks
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

export const getFeedbacksForSite = async (req, res, next) => {
    try {
        const {query} = req;
        // @ts-ignore
        const feedbacks = await UserFeedback.aggregatePaginate(UserFeedback.aggregate([
            {
                $match: {
                    approved: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: {'user': '$user'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$user'],
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                phone: 1,
                                image: 1,
                            }
                        },
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {$sort: {createdAt: -1}}
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
        });
        return res.status(200).json({
            error: false,
            data: feedbacks
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

export const getUserFeedback = async (req, res, next) => {
    try {
        const {query} = req;
        // @ts-ignore
        const feedback = await UserFeedback.aggregate([
            {
                $lookup: {
                    from: 'users',
                    let: {'user': '$user'},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$user'],
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                phone: 1,
                                image: 1,
                            }
                        },
                    ],
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
        ])
        return res.status(200).json({
            error: false,
            data: feedback[0]
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

// delete UserFeedback
export const delUserFeedback = async (req, res, next) => {
    try {
        const {query} = req;
        await UserFeedback.findByIdAndDelete(query._id);
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