import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import multer from "multer";
import mongoose from 'mongoose';
import compression from 'compression';
import morgan from 'morgan';
import jwt from 'jsonwebtoken'
import fs from 'fs';
import chatApp from "./utils/chat";

const app = express()
const PORT = process.env.PORT || 443;

// middleware
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

const isEnvExist = fs.existsSync('./.env');

// check environment file
if (isEnvExist === false) {
    const {createAdminAndEnv} = require("./controllers/admin.controller");

    app.get('/', (req, res, next) => {
        return res.status(200).json({
            status: true,
            env: false
        })
    })

    app.post('/setting', createAdminAndEnv)

    // server listening
    app.listen(PORT, () => console.log(`Server is listening on port : ${PORT}`))

} else {

    let socketIds = {}
    const http = require('http').Server(app);
    const io = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    });

    const secret = process.env.JWT_SECRET
    io.on('connection', socket => {
        let token = socket.handshake?.auth?.token
        if (!!token) {
            try {
                let user = jwt.verify(token, secret)
                // @ts-ignore
                socketIds[socket.id] = user._id
            } catch (e) {
                socket.conn.close()
                return
            }
        }
        // else {
        //     socket.conn.close()
        // }
        socket.on('disconnect', () => {
            delete socketIds[socket.id]
        })
    })
    app.use(chatApp(io))

    const {decodeToken} = require('./auth');
    const apiRouters = require('./routes/api');

    // database connection
    mongoose.connect(process.env.DB_STRING).then((response) => {
        console.log('MongoDB Connected Successfully.')
    }).catch((err) => {
        console.log('Database connection failed.')
    })

    // morgan routes view
    if (process.env.NODE_ENV === "development") {
        app.use(morgan("tiny"));
        console.log("Morgan connected..");
    }

    // middleware
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); //* will allow from all cross domain
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        )
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        res.locals.socket = io
        res.locals.socketIds = socketIds
        next()
    });
    app.use(decodeToken);
    app.use('/api', apiRouters);

    // server welcome message
    app.use('/', (req, res, next) => {
        return res.status(200).json({
            error: false,
            msg: 'Welcome to Car2Go'
        })
    })

    // multer error handler
    app.use((error, req, res, next) => {
        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "file is too large",
                });
            }
            if (error.code === "LIMIT_FILE_COUNT") {
                return res.status(400).json({
                    message: "File limit reached",
                });
            }
            if (error.code === "LIMIT_UNEXPECTED_FILE") {
                return res.status(400).json({
                    message: "File must be an image/pdf/csv",
                });
            }
        }
    });

    const cron = require('node-cron');
    const {cornEmail} = require("./utils/marketing/emailCron");
    const {cornSms} = require("./utils/marketing/smsCron");
    const {cornNotification} = require("./utils/push_notification/cron_notification");
    const {cornWhatsapp} = require("./utils/marketing/whatsappCron")

    //run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        cornEmail();
        cornSms()
        cornWhatsapp()
        cornNotification()
    });

    // server listening
    http.listen(PORT, () => console.log(`Port is listening ${PORT}`))
}
