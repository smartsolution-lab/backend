"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.havePermission = exports.isDemoRequest = exports.userAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const secret = process.env.JWT_SECRET;
exports.decodeToken = (req, res, next) => {
    try {
        const token = req.headers?.authorization?.split(" ")[1];
        res.locals.user = jsonwebtoken_1.default.verify(token, secret);
        next();
    }
    catch (err) {
        next();
    }
};
const userAuth = ({ permission = "", isAdmin = false, isUser = false, isDriver = false, isAuth = false }) => async (req, res, next) => {
    try {
        const token = req.headers?.authorization?.split(" ")[1];
        let decode = jsonwebtoken_1.default.verify(token, secret);
        // @ts-ignore
        let user = await user_model_1.default.findById(decode._id, "role permission").populate("permission");
        res.locals.user = user;
        const userRoles = ['admin', 'user', 'driver', 'employee'];
        if (isAdmin && user.role === "admin") {
            next();
            return;
        }
        else if (isUser && user.role === "user") {
            next();
            return;
            // @ts-ignore
        }
        else if (isDriver && user.role === "driver") {
            next();
            return;
            // @ts-ignore
        }
        else if (userRoles.includes(user.role) && isAuth) {
            next();
            return;
        }
        else if ((0, exports.havePermission)(permission, user.permission)) {
            next();
            return;
        }
        return res.status(401).send({
            error: true,
            msg: "Unauthorized access",
        });
    }
    catch (err) {
        return res.status(401).send({
            error: true,
            msg: "Unauthorized access",
        });
    }
};
exports.userAuth = userAuth;
const isDemoRequest = async (req, res, next) => {
    try {
        const isDemo = process.env.PRODUCT_MODE;
        if (isDemo === "demo") {
            return res.status(401).send({
                error: true,
                msg: "Demo request rejected",
            });
        }
        next();
        return;
    }
    catch (err) {
        return res.status(401).send({
            error: true,
            msg: "Unauthorized access",
        });
    }
};
exports.isDemoRequest = isDemoRequest;
const havePermission = (permission, roles) => {
    for (let role of roles || []) {
        if (role.permissions.includes(permission)) {
            return true;
        }
    }
    return false;
};
exports.havePermission = havePermission;
//# sourceMappingURL=index.js.map