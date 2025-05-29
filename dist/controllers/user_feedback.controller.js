"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delUserFeedback = exports.getUserFeedback = exports.getFeedbacksForSite = exports.getUserFeedbacks = exports.updateUserFeedback = exports.postUserFeedback = void 0;
const user_feedback_model_1 = __importDefault(require("../models/user_feedback.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// post UserFeedback
const postUserFeedback = async (req, res, next) => {
    try {
        const { body } = req;
        const { user } = res.locals;
        const isExist = await user_feedback_model_1.default.findOne({ user: new mongoose_1.default.Types.ObjectId(user._id) });
        if (!!isExist) {
            return res.status(200).json({
                error: true,
                msg: 'Already submitted!',
            });
        }
        const user_response = await user_feedback_model_1.default.create({
            user: user._id,
            comment: body.comment,
            rating: +body.rating,
        });
        return res.status(200).json({
            error: false,
            msg: 'Successfully created!',
            data: user_response
        });
    }
    catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({
                error: true,
                msg: 'Duplicate warning!'
            });
        }
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.postUserFeedback = postUserFeedback;
// update UserFeedback
const updateUserFeedback = async (req, res, next) => {
    try {
        const { body } = req;
        await user_feedback_model_1.default.findByIdAndUpdate(body._id, { $set: body });
        return res.status(200).json({
            error: false,
            msg: 'Successfully updated'
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.updateUserFeedback = updateUserFeedback;
const getUserFeedbacks = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        if (query.search) {
            filter = {
                $or: [
                    { "user.name": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "user.email": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "user.phone": { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { "rating": +query.search },
                ]
            };
        }
        // @ts-ignore
        const feedbacks = await user_feedback_model_1.default.aggregatePaginate(user_feedback_model_1.default.aggregate([
            {
                $lookup: {
                    from: 'users',
                    let: { 'user': '$user' },
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
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
        });
        return res.status(200).json({
            error: false,
            data: feedbacks
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.getUserFeedbacks = getUserFeedbacks;
const getFeedbacksForSite = async (req, res, next) => {
    try {
        const { query } = req;
        // @ts-ignore
        const feedbacks = await user_feedback_model_1.default.aggregatePaginate(user_feedback_model_1.default.aggregate([
            {
                $match: {
                    approved: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { 'user': '$user' },
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
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } }
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
        });
        return res.status(200).json({
            error: false,
            data: feedbacks
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.getFeedbacksForSite = getFeedbacksForSite;
const getUserFeedback = async (req, res, next) => {
    try {
        const { query } = req;
        // @ts-ignore
        const feedback = await user_feedback_model_1.default.aggregate([
            {
                $lookup: {
                    from: 'users',
                    let: { 'user': '$user' },
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
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        ]);
        return res.status(200).json({
            error: false,
            data: feedback[0]
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.getUserFeedback = getUserFeedback;
// delete UserFeedback
const delUserFeedback = async (req, res, next) => {
    try {
        const { query } = req;
        await user_feedback_model_1.default.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        });
    }
};
exports.delUserFeedback = delUserFeedback;
//# sourceMappingURL=user_feedback.controller.js.map