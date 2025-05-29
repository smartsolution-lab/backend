import jwt from 'jsonwebtoken'
import User from "../models/user.model";

const secret = process.env.JWT_SECRET


exports.decodeToken = (req, res, next) => {
    try {
        const token = req.headers?.authorization?.split(" ")[1]
        res.locals.user = jwt.verify(token, secret)
        next()
    } catch (err) {
        next()
    }
}


export const userAuth = (
    {permission = "", isAdmin = false, isUser = false, isDriver = false, isAuth = false}
) => async (req, res, next) => {
    try {
        const token = req.headers?.authorization?.split(" ")[1];
        let decode = jwt.verify(token, secret);
        // @ts-ignore
        let user = await User.findById(decode._id, "role permission").populate("permission");
        res.locals.user = user;
        const userRoles = ['admin', 'user', 'driver', 'employee']
        if (isAdmin && user.role === "admin") {
            next();
            return;
        } else if (isUser && user.role === "user") {
            next();
            return;
            // @ts-ignore
        } else if (isDriver && user.role === "driver") {
            next();
            return;
            // @ts-ignore
        } else if (userRoles.includes(user.role) && isAuth) {
            next();
            return;
        } else if (havePermission(permission, user.permission)) {
            next()
            return
        }
        return res.status(401).send({
            error: true,
            msg: "Unauthorized access",
        });
    } catch (err) {
        return res.status(401).send({
            error: true,
            msg: "Unauthorized access",
        });
    }
};


export const isDemoRequest = async (req, res, next) => {
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
    } catch (err) {
        return res.status(401).send({
            error: true,
            msg: "Unauthorized access",
        });
    }
};


export const havePermission = (permission, roles) => {
    for (let role of roles || []) {
        if (role.permissions.includes(permission)) {
            return true
        }
    }
    return false
}