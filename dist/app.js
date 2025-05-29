"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const mongoose_1 = __importDefault(require("mongoose"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const chat_1 = __importDefault(require("./utils/chat"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 443;
// middleware
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
const isEnvExist = fs_1.default.existsSync('./.env');
// check environment file
if (isEnvExist === false) {
    const { createAdminAndEnv } = require("./controllers/admin.controller");
    app.get('/', (req, res, next) => {
        return res.status(200).json({
            status: true,
            env: false
        });
    });
    app.post('/setting', createAdminAndEnv);
    // server listening
    app.listen(PORT, () => console.log(`Server is listening on port : ${PORT}`));
}
else {
    let socketIds = {};
    const http = require('http').Server(app);
    const io = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    });
    const secret = process.env.JWT_SECRET;
    io.on('connection', socket => {
        let token = socket.handshake?.auth?.token;
        if (!!token) {
            try {
                let user = jsonwebtoken_1.default.verify(token, secret);
                // @ts-ignore
                socketIds[socket.id] = user._id;
            }
            catch (e) {
                socket.conn.close();
                return;
            }
        }
        // else {
        //     socket.conn.close()
        // }
        socket.on('disconnect', () => {
            delete socketIds[socket.id];
        });
    });
    app.use((0, chat_1.default)(io));
    const { decodeToken } = require('./auth');
    const apiRouters = require('./routes/api');
    // database connection
    mongoose_1.default.connect(process.env.DB_STRING).then((response) => {
        console.log('MongoDB Connected Successfully.');
    }).catch((err) => {
        console.log('Database connection failed.');
    });
    // morgan routes view
    if (process.env.NODE_ENV === "development") {
        app.use((0, morgan_1.default)("tiny"));
        console.log("Morgan connected..");
    }
    // middleware
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); //* will allow from all cross domain
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.locals.socket = io;
        res.locals.socketIds = socketIds;
        next();
    });
    app.use(decodeToken);
    app.use('/api', apiRouters);
    // server welcome message
    app.use('/', (req, res, next) => {
        return res.status(200).json({
            error: false,
            msg: 'Welcome to Car2Go'
        });
    });
    // multer error handler
    app.use((error, req, res, next) => {
        if (error instanceof multer_1.default.MulterError) {
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
    const { cornEmail } = require("./utils/marketing/emailCron");
    const { cornSms } = require("./utils/marketing/smsCron");
    const { cornNotification } = require("./utils/push_notification/cron_notification");
    const { cornWhatsapp } = require("./utils/marketing/whatsappCron");
    //run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        cornEmail();
        cornSms();
        cornWhatsapp();
        cornNotification();
    });
    // server listening
    http.listen(PORT, () => console.log(`Port is listening ${PORT}`));
}
//# sourceMappingURL=app.js.map