"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminAndEnv = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
// create admin/super-admin
const createAdminAndEnv = async (req, res, next) => {
    try {
        const { adminInfo, valueString, DB_String } = req.body;
        const { name, email, phone, password, confirmPassword } = adminInfo;
        const envValues = valueString + "\n" + `JWT_SECRET=${crypto_1.default.randomBytes(12).toString('hex') + Date.now()}` + "\n" + `JWT_EXPIRE_IN="24h"` + "\n" + `JWT_EXPIRE_IN_REMEMBER_ME="168h"`;
        if (adminInfo?.password !== adminInfo?.confirmPassword) {
            return res.status(400).json({
                message: "Password invalid",
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 8);
        const ID = crypto_1.default.randomBytes(4).toString('hex');
        const u = `${DB_String.split('=')[0]}`;
        const r = `${DB_String.split(`${u}=`)[1]}`;
        // Database connection
        const db = `${r}`;
        await mongoose_1.default.connect(db);
        const newUser = await user_model_1.default.create({
            name,
            email,
            phone,
            role: 'admin',
            password: hashedPassword,
            terms_conditions: true,
            ID,
            verified: true
        });
        await promises_1.default.writeFile(path_1.default.join(__dirname, '../.env'), envValues, { flag: "wx" });
        return res.status(200).json({
            status: true,
            env: true
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
exports.createAdminAndEnv = createAdminAndEnv;
//# sourceMappingURL=admin.controller.js.map