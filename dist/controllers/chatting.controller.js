"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMsg = exports.messages = exports.messageSend = void 0;
const message_model_1 = __importDefault(require("../models/message.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// post message
const messageSend = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { body } = req;
        const { user } = res.locals;
        const new_msg = await message_model_1.default.create({ ...body, from: user?._id });
        const msg = await message_model_1.default.findOne({ _id: new_msg?._id }).populate('from', 'email phone name');
        for (let socket_id of Object.keys(socketIds)) {
            // send to the rider
            // @ts-ignore
            if (socketIds[socket_id] === msg?.to?.toString()) {
                // @ts-ignore
                io.to(socket_id).emit('new_msg_received', { message: msg?.message, from: msg?.from, createdAt: msg?.createdAt, _id: msg?._id });
                const messages = await message_model_1.default.find({
                    $or: [
                        { $and: [{ from: user._id }, { to: new mongoose_1.default.Types.ObjectId(body?.to) }] },
                        { $and: [{ from: new mongoose_1.default.Types.ObjectId(body?.to) }, { to: user._id }] },
                    ]
                }, 'message createdAt from to').populate('from', 'name email phone');
                io.to(socket_id).emit('load_msg', messages);
            }
            // send to the user
            // @ts-ignore
            if (socketIds[socket_id] === user?._id?.toString()) {
                // @ts-ignore
                io.to(socket_id).emit('new_msg_received', { message: msg?.message, from: msg?.from, createdAt: msg?.createdAt, _id: msg?._id });
                const messages = await message_model_1.default.find({
                    $or: [
                        { $and: [{ from: user._id }, { to: new mongoose_1.default.Types.ObjectId(body?.to) }] },
                        { $and: [{ from: new mongoose_1.default.Types.ObjectId(body?.to) }, { to: user._id }] },
                    ]
                }, 'message createdAt from to').populate('from', 'name email phone');
                io.to(socket_id).emit('load_msg', messages);
            }
        }
        return res.status(200).json({
            error: false,
            msg: 'new message received',
            data: {
                message: msg?.message,
                from: msg?.from,
                // @ts-ignore
                createdAt: msg?.createdAt,
                _id: msg?._id
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.messageSend = messageSend;
// load messages
const messages = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { query } = req;
        const { user } = res.locals;
        const messages = await message_model_1.default.find({
            $or: [
                { $and: [{ from: user._id }, { to: new mongoose_1.default.Types.ObjectId(query?.to) }] },
                { $and: [{ from: new mongoose_1.default.Types.ObjectId(query?.to) }, { to: user._id }] },
            ]
        }, 'message createdAt from').populate('from', 'name email phone');
        return res.status(200).json({
            error: false,
            msg: 'Success',
            data: messages
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.messages = messages;
const deleteMsg = async (req, res, next) => {
    try {
        const { _id } = req.query;
        const messages = await message_model_1.default.deleteOne({ _id: new mongoose_1.default.Types.ObjectId(_id) });
        return res.status(200).json({
            error: false,
            msg: 'Success',
            data: messages
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        });
    }
};
exports.deleteMsg = deleteMsg;
//# sourceMappingURL=chatting.controller.js.map