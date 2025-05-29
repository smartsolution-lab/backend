"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delCoupon = exports.getCouponOffer = exports.getCoupon = exports.couponApply = exports.createCoupon = void 0;
const settings_model_1 = __importDefault(require("../models/settings.model"));
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = __importDefault(require("mongoose"));
const coupon_model_1 = __importDefault(require("../models/coupon.model"));
const service_price_model_1 = __importDefault(require("../models/service_price.model"));
// create Coupon Code
const createCoupon = async (req, res, next) => {
    try {
        const { body } = req;
        console.log("🚀 ~ file: coupon.controller.ts:9 ~ createCoupon ~ body", body);
        if (body?._id) {
            await coupon_model_1.default.findByIdAndUpdate(body._id, { $set: body }, { validateBeforeSave: false });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        else {
            const newCoupon = await coupon_model_1.default.create({
                status: body.status,
                type: body.type,
                value: body.value,
                name: body.name,
                coupon_description: body.coupon_description,
                coupon_minimum_amount: body.coupon_minimum_amount,
                start_duration: body.start_duration,
                end_duration: body.end_duration,
            });
            if (!newCoupon)
                return res.status(400).json({ msg: 'Wrong input! try again..', error: true });
            return res.status(200).json({
                error: false,
                msg: "Coupon created successfully",
                data: newCoupon
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error",
        });
    }
};
exports.createCoupon = createCoupon;
const couponApply = async (req, res, next) => {
    try {
        const { body } = req;
        const couponCode = await coupon_model_1.default.findOne({ name: body.coupon_code.trim().toLowerCase() });
        if (!couponCode) {
            return res.status(400).json({
                error: true,
                msg: `Coupon "${body?.coupon_code}" does not exist!`
            });
        }
        if (couponCode?.status === 'disabled') {
            return res.status(400).json({
                error: true,
                msg: `Coupon "${body?.coupon_code}" is not in service!`
            });
        }
        const startDate = !!couponCode?.start_duration ? (0, moment_1.default)(couponCode?.start_duration).format() : false;
        const endDate = !!couponCode?.end_duration ? (0, moment_1.default)(couponCode?.end_duration).format() : false;
        const todayDate = (0, moment_1.default)(Date.now()).format();
        if (!!startDate && !!endDate) {
            if (startDate > todayDate) {
                return res.status(400).json({
                    error: true,
                    msg: `Coupon Will Be Released Soon!`
                });
            }
            if (todayDate > endDate) {
                return res.status(400).json({
                    error: true,
                    msg: `Coupon "${body?.coupon_code}" expired!`
                });
            }
        }
        const price = await service_price_model_1.default.findOne({
            category: new mongoose_1.default.Types.ObjectId(body.category),
            service_package: new mongoose_1.default.Types.ObjectId(body.service_package),
            service: new mongoose_1.default.Types.ObjectId(body.service),
            service_vehicle: new mongoose_1.default.Types.ObjectId(body.service_vehicle),
        });
        // @ts-ignore
        const additionalFare = price?.additional_fees.reduce((accumulator, currentValue) => accumulator += currentValue.additional_fee, 0);
        // @ts-ignore
        const fares = Number(price.base_fair) + (Number(price.per_kilo_charge) * Number(body.distance)) + (Number(price?.waiting_charge || 0) * Number(body?.waiting_time || 0));
        const subtotal = (+fares) + (+additionalFare);
        let total = 0;
        let company_commission;
        if (price?.commission_type === 'fixed_amount') {
            total = Number((subtotal + Number(price?.company_commission)).toFixed(2));
            company_commission = price?.company_commission;
        }
        else if (price?.commission_type === 'percentage') {
            total = Number((subtotal + (subtotal * (Number(price?.company_commission) / 100))).toFixed(2));
            company_commission = `${price?.company_commission}%`;
        }
        const charged_amount = Number((total - subtotal).toFixed(2));
        const setting = await settings_model_1.default.findOne({});
        let current_subtotal, saved_money, coupon_applied;
        if (couponCode?.type === 'percentage') {
            saved_money = Number((subtotal * ((+couponCode?.value) / 100)).toFixed(2));
            current_subtotal = Number((subtotal - saved_money).toFixed(2));
            coupon_applied = `${couponCode?.value}%`;
        }
        else if (couponCode?.type === 'amount') {
            saved_money = (+couponCode?.value);
            current_subtotal = Number((subtotal - saved_money).toFixed(2));
            coupon_applied = `${setting?.currency_code}${couponCode?.value}`;
        }
        if ((+subtotal) < (+couponCode?.value)) {
            return res.status(500).json({
                error: true,
                msg: 'The subtotal must be greater than the coupon value'
            });
        }
        return res.status(200).send({
            error: false,
            msg: "Coupon applied successfully",
            data: {
                fares: Number(fares).toFixed(2),
                additional_fares: Number(additionalFare).toFixed(2),
                subtotal: Number(subtotal).toFixed(2),
                // coupon: {
                //     coupon_applied: coupon_applied,
                //     saved_money: Number(saved_money).toFixed(2),
                //     current_subtotal: Number(current_subtotal).toFixed(2),
                // },
                coupon_applied: coupon_applied,
                coupon_code: body?.coupon_code,
                saved_money: Number(saved_money).toFixed(2),
                current_subtotal: Number(current_subtotal).toFixed(2),
                vat: company_commission,
                vat_amount: Number(charged_amount).toFixed(2),
                total: Number(current_subtotal + charged_amount).toFixed(2),
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.couponApply = couponApply;
// get Coupon
const getCoupon = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { value: Number(query.search) },
                    { type: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { status: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const couponCode = await coupon_model_1.default.aggregate([
            ...(!!query._id ? [
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(query._id)
                    }
                }
            ] : []),
            { $match: filter },
            { $sort: { createdAt: -1 } }
        ]);
        return res.status(200).json({
            error: false,
            data: !!query._id ? couponCode[0] : couponCode
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getCoupon = getCoupon;
// get Coupon
const getCouponOffer = async (req, res, next) => {
    try {
        const { query } = req;
        let filter = {};
        if (!!query.search) {
            filter = {
                $or: [
                    { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { value: Number(query.search) },
                    { type: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    { status: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                ]
            };
        }
        // @ts-ignore
        const couponCode = await coupon_model_1.default.aggregate([
            {
                $match: { status: 'active' }
            },
            { $match: filter },
            {
                $project: {
                    code: '$name',
                    value: '$value',
                    type: '$type',
                    status: '$status',
                    coupon_description: { $ifNull: ["$coupon_description", "New Offer"] },
                    createdAt: '$createdAt',
                    updatedAt: '$updatedAt',
                    start_duration: { $ifNull: ["$start_duration", "-"] },
                    end_duration: { $ifNull: ["$end_duration", "-"] },
                    coupon_minimum_amount: { $ifNull: ["$coupon_minimum_amount", "-"] },
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        return res.status(200).json({
            error: false,
            data: !!query._id ? couponCode[0] : couponCode
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getCouponOffer = getCouponOffer;
// delete Coupon
const delCoupon = async (req, res, next) => {
    try {
        const { query } = req;
        const del = await coupon_model_1.default.findByIdAndDelete(query._id);
        if (!del)
            return res.status(400).json({ error: true, msg: "Failed!" });
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.delCoupon = delCoupon;
//# sourceMappingURL=coupon.controller.js.map