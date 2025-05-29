import bcrypt from "bcrypt";
import crypto from "crypto";
import User from '../models/user.model';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';


// create admin/super-admin
export const createAdminAndEnv = async (req, res, next) => {
    try {
        const { adminInfo, valueString, DB_String } = req.body;
        const { name, email, phone, password, confirmPassword } = adminInfo;

        const envValues = valueString + "\n" + `JWT_SECRET=${crypto.randomBytes(12).toString('hex') + Date.now()}` + "\n" + `JWT_EXPIRE_IN="24h"` + "\n" + `JWT_EXPIRE_IN_REMEMBER_ME="168h"`

        if (adminInfo?.password !== adminInfo?.confirmPassword) {
            return res.status(400).json({
                message: "Password invalid",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const ID = crypto.randomBytes(4).toString('hex')

        const u = `${DB_String.split('=')[0]}`
        const r = `${DB_String.split(`${u}=`)[1]}`

        // Database connection
        const db = `${r}`;
        await mongoose.connect(db);

        const newUser = await User.create({
            name,
            email,
            phone,
            role: 'admin',
            password: hashedPassword,
            terms_conditions: true,
            ID,
            verified: true
        });

        await fs.writeFile(path.join(__dirname, '../.env'), envValues, { flag: "wx" });

        return res.status(200).json({
            status: true,
            env: true
        })

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        })

    }
}