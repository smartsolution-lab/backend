import mongoose, {connection} from "mongoose";
import jwt from 'jsonwebtoken'
import User from "../models/user.model";
import Message from "../models/message.model";

const secret = process.env.JWT_SECRET
const chatApp = (io) => {
    let userConnected = {}
    let socketids = {}
    io.of("/messages").on('connection', (socket) => {
        let token = socket.handshake?.auth?.token
        if (!!token) {
            try {
                let user = jwt.verify(token, secret)
                // @ts-ignore
                socketids[user.id] = socket.id
                // @ts-ignore
                userConnected[socket.id] = user._id
            } catch (e) {
                socket.conn.close()
                return
            }
        }

        (async () => {
            try {
                let users = await User.aggregate([
                    {
                        $match: {
                            _id: {$ne: new mongoose.Types.ObjectId(userConnected[socket.id])},
                        }
                    },
                    {
                        $lookup: {
                            from: 'messages',
                            let: {user: "$_id"},
                            pipeline: [
                                {$match: {$expr: {$or: [{$eq: ["$from", "$$user"]}, {$eq: ["$to", "$$user"]}]}}},
                                {$sort: {createdAt: -1}},
                                {$limit: 1}
                            ],
                            as: 'last_message'
                        }
                    },
                    {$unwind: {path: "$last_message", preserveNullAndEmptyArrays: true}},
                    {
                        $project: {
                            first_name: 1,
                            last_name: 1,
                            email: 1,
                            last_message: {
                                createdAt: 1,
                                message: 1,
                            }
                        }
                    },
                    {
                        $sort: {"last_message.createdAt": -1}
                    }
                ])
                socket.emit('users', users)
            } catch (e) {

            }
        })()


        const getMessages = async (from, to, limit = 20) => {
            try {
                let messages = await Message.aggregate([
                    {
                        $match: {
                            $or: [
                                {from: new mongoose.Types.ObjectId(from), to: new mongoose.Types.ObjectId(to),},
                                {from: new mongoose.Types.ObjectId(to), to: new mongoose.Types.ObjectId(from)}
                            ]
                        }
                    },
                    {
                        $project: {
                            from: 1,
                            to: 1,
                            message: 1,
                            seen: 1,
                            delivered: 1,
                            createdAt: 1,
                        }
                    },
                    {
                        $sort: {createdAt: -1}
                    },
                    {
                        $limit: limit
                    }
                ])
                return messages
            } catch (e) {
                return []
            }
        }

        socket.on('load_message', data => {
            (async () => {
                let messages = await getMessages(data.user, userConnected[socket.id])
                socket.emit('load_message', {
                    user: data.user, messages
                })
            })()
        })

        socket.on('typing', data => {
            Object.keys(userConnected)?.map(key => {
                if (userConnected[key] === data.user) {
                    (async () => {
                        io.of("/messages").to(key).emit('typing', {
                            user: userConnected[socket.id],
                        })
                    })()
                }
            })
        });

        socket.on('send', data => {
            let from = userConnected[socket.id]
            if (!!from) {
                (async () => {
                    try {
                        let message = await Message.create({
                            from,
                            to: data.user,
                            message: data.message,
                            _id: data._id
                        })
                        Object.keys(userConnected)?.map(key => {
                            if (userConnected[key] === data.user) {
                                (async () => {
                                    io.of("/messages").to(key).emit('load_message', {
                                        user: from, messages: [message]
                                    })
                                })()
                            }
                        })
                        Object.keys(userConnected)?.map(key => {
                            if (userConnected[key] === from) {
                                (async () => {
                                    io.of("/messages").to(key).emit('load_message', {
                                        user: data.user, messages: [message]
                                    })
                                })()
                            }
                        })
                    } catch (e) {

                    }
                })()
            }
        })

        socket.on('delivered', data => {
            (async () => {
                try {
                    await Message.updateMany({
                        from: data.user,
                        to: userConnected[socket.id],
                        _id: {$in: data.delivered || []}
                    }, {delivered: true})
                    Object.keys(userConnected)?.map(key => {
                        if (userConnected[key] === data.user) {
                            (async () => {
                                io.of("/messages").to(key).emit('delivered', {
                                    user: userConnected[socket.id], delivered: data.delivered
                                })
                            })()
                        }
                    })
                } catch (e) {

                }
            })()

        })

        socket.on('seen', data => {
            (async () => {
                try {
                    await Message.updateMany({
                        from: data.user,
                        to: userConnected[socket.id],
                        _id: {$in: data.seen || []}
                    }, {seen: true})
                    Object.keys(userConnected)?.map(key => {
                        if (userConnected[key] === data.user) {
                            (async () => {
                                io.of("/messages").to(key).emit('seen', {
                                    user: userConnected[socket.id], seen: data.seen
                                })
                            })()
                        }
                    })
                } catch (e) {

                }
            })()

        })

        socket.on('disconnect', () => {
            delete userConnected[socket.id]
        })
    });

    return (req, res, next) => {
        res.locals.socket = io
        next()
    }
}


export default chatApp