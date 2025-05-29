import Message from "../models/message.model";
import mongoose from "mongoose";


// post message
export const messageSend = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { body } = req;
        const { user } = res.locals;

        const new_msg = await Message.create({ ...body, from: user?._id })
        const msg = await Message.findOne({_id: new_msg?._id}).populate('from', 'email phone name');

        for (let socket_id of Object.keys(socketIds)) {
            // send to the rider
            // @ts-ignore
            if (socketIds[socket_id] === msg?.to?.toString()) {
                // @ts-ignore
                io.to(socket_id).emit('new_msg_received', {message: msg?.message, from: msg?.from, createdAt: msg?.createdAt, _id: msg?._id});
                const messages = await Message.find({
                    $or: [
                        {$and: [{from: user._id}, {to: new mongoose.Types.ObjectId(body?.to)}]},
                        {$and: [{from: new mongoose.Types.ObjectId(body?.to)}, {to: user._id}]},
                    ]
                }, 'message createdAt from to').populate('from', 'name email phone')
                io.to(socket_id).emit('load_msg', messages);
            }

            // send to the user
            // @ts-ignore
            if (socketIds[socket_id] === user?._id?.toString()) {
                // @ts-ignore
                io.to(socket_id).emit('new_msg_received', {message: msg?.message, from: msg?.from, createdAt: msg?.createdAt, _id: msg?._id});
                const messages = await Message.find({
                    $or: [
                        {$and: [{from: user._id}, {to: new mongoose.Types.ObjectId(body?.to)}]},
                        {$and: [{from: new mongoose.Types.ObjectId(body?.to)}, {to: user._id}]},
                    ]
                }, 'message createdAt from to').populate('from', 'name email phone')
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
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}

// load messages
export const messages = async (req, res, next) => {
    let io = res.locals.socket;
    let socketIds = res.locals.socketIds;
    try {
        const { query } = req;
        const { user } = res.locals;

        const messages = await Message.find({
            $or: [
                {$and: [{from: user._id}, {to: new mongoose.Types.ObjectId(query?.to)}]},
                {$and: [{from: new mongoose.Types.ObjectId(query?.to)}, {to: user._id}]},
            ]

        }, 'message createdAt from').populate('from', 'name email phone')

        return res.status(200).json({
            error: false,
            msg: 'Success',
            data: messages
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}


export const deleteMsg = async (req, res, next) => {
    try {
        const { _id } = req.query;
        const messages = await Message.deleteOne({ _id: new mongoose.Types.ObjectId(_id) })
        return res.status(200).json({
            error: false,
            msg: 'Success',
            data: messages
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}