"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postLanguageTranslations = exports.getLanguageTranslations = exports.delLanguage = exports.postLanguage = exports.getAllLanguages = exports.getLanguages = exports.updateSettings = exports.getPaymentsGateways = exports.getPaymentsSettings = exports.getSiteSettings = exports.getSettings = void 0;
const settings_model_1 = __importDefault(require("../models/settings.model"));
const language_model_1 = __importDefault(require("../models/language.model"));
const getSettings = async (req, res) => {
    try {
        let settings = await settings_model_1.default.findOne();
        return res.status(200).send({
            error: false,
            msg: 'Successfully gets settings',
            data: settings
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getSettings = getSettings;
const getSiteSettings = async (req, res) => {
    try {
        let settings = await settings_model_1.default.findOne({}, ['max_distance', 'site_name', 'site_footer', 'logo', 'site_phone', 'site_email', 'address', 'currency_code', 'currency_name', 'description', "social_media_link", 'url', 'recaptcha', 'auto_cancel_reason', 'cancellation_reason']);
        return res.status(200).send({
            error: false,
            msg: 'Successfully gets settings',
            data: settings
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getSiteSettings = getSiteSettings;
const getPaymentsSettings = async (req, res) => {
    const { query } = req;
    try {
        let settings = await settings_model_1.default.findOne({}, ['ssl_commercez', 'stripe', 'razor_pay', 'paypal', 'mollie']);
        return res.status(200).send({
            error: false,
            msg: 'Successfully gets settings',
            data: settings
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getPaymentsSettings = getPaymentsSettings;
const getPaymentsGateways = async (req, res) => {
    const { query } = req;
    try {
        let gateways = await settings_model_1.default.aggregate([
            {
                $project: {
                    gateways: [
                        {
                            active: "$ssl_commercez.credentials.active",
                            name: "$ssl_commercez.name",
                            image: "$ssl_commercez.image",
                        },
                        {
                            active: "$stripe.credentials.active",
                            name: "$stripe.name",
                            image: "$stripe.image",
                        },
                        {
                            active: "$razor_pay.credentials.active",
                            name: "$razor_pay.name",
                            image: "$razor_pay.image",
                        },
                        {
                            active: "$paypal.credentials.active",
                            name: "$paypal.name",
                            image: "$paypal.image",
                        },
                        {
                            active: "$mollie.credentials.active",
                            name: "$mollie.name",
                            image: "$mollie.image",
                        },
                        {
                            active: "$flutterwave.credentials.active",
                            name: "$flutterwave.name",
                            image: "$flutterwave.image",
                        },
                    ]
                }
            }
        ]);
        return res.status(200).send({
            error: false,
            msg: 'Successfully gets settings',
            data: gateways[0]
        });
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getPaymentsGateways = getPaymentsGateways;
const updateSettings = async (req, res) => {
    try {
        let { body } = req;
        if (!!req.body.email) {
            const key = Object.keys(body.email)[0];
            if (req.body.email.default === true) {
                await settings_model_1.default.findOneAndUpdate({}, { $set: { "email.default": key } }, { upsert: true, new: true });
            }
            switch (key) {
                case 'sendgrid':
                    await settings_model_1.default.findOneAndUpdate({}, { $set: { "email.sendgrid": body.email.sendgrid } }, { upsert: true, new: true });
                    return res.status(200).send({
                        error: false,
                        msg: 'Successfully updated settings'
                    });
                case 'gmail':
                    await settings_model_1.default.findOneAndUpdate({}, { $set: { "email.gmail": body.email.gmail } }, { upsert: true, new: true });
                    return res.status(200).send({
                        error: false,
                        msg: 'Successfully updated settings'
                    });
                case 'other':
                    await settings_model_1.default.findOneAndUpdate({}, { $set: { "email.other": body.email.other } }, { upsert: true, new: true });
                    return res.status(200).send({
                        error: false,
                        msg: 'Successfully updated settings'
                    });
            }
        }
        else {
            await settings_model_1.default.findOneAndUpdate({}, { ...body }, { upsert: true });
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated settings'
            });
        }
    }
    catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.updateSettings = updateSettings;
// Setting.updateById(_id, {$set: {gmail: {status: "e"}, sendGrid: {status: "d"}}})
const getLanguages = async (req, res) => {
    try {
        let languages = await language_model_1.default.find({ active: true }, 'name code flag active default rtl');
        if (languages?.length === 0) {
            await language_model_1.default.create({
                name: 'English',
                code: 'en',
                flag: 'US',
                default: true
            });
            languages = await language_model_1.default.find({}, 'name code flag active default rtl');
        }
        return res.status(200).send({
            error: false,
            msg: 'Successfully gets languages',
            data: languages
        });
    }
    catch (e) {
        res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getLanguages = getLanguages;
const getAllLanguages = async (req, res) => {
    try {
        let languages = await language_model_1.default.find({}, 'name code flag active default rtl');
        if (languages?.length === 0) {
            await language_model_1.default.create({
                name: 'English',
                code: 'en',
                flag: 'US',
                default: true
            });
            languages = await language_model_1.default.find({}, 'name code flag active default rtl');
        }
        return res.status(200).send({
            error: false,
            msg: 'Successfully gets languages',
            data: languages
        });
    }
    catch (e) {
        res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getAllLanguages = getAllLanguages;
const postLanguage = async (req, res) => {
    try {
        const { body } = req;
        if (body._id) {
            if (body.default === true) {
                await language_model_1.default.updateMany({}, { default: false });
                await language_model_1.default.findByIdAndUpdate(body._id, {
                    default: true,
                    active: true,
                });
                return res.status(200).send({
                    error: false,
                    msg: 'Successfully updated default language'
                });
            }
            else if (body.default === false) {
                return res.status(401).send({
                    error: true,
                    msg: 'At least a language will be default'
                });
            }
            else if (body.active !== undefined) {
                let language = await language_model_1.default.findById(body._id, 'default active');
                if (language?.default === false) {
                    language.active = body.active;
                    await language.save();
                    return res.status(200).send({
                        error: false,
                        msg: 'Successfully updated language status'
                    });
                }
                return res.status(401).send({
                    error: true,
                    msg: 'Default language status is not changeable'
                });
            }
            await language_model_1.default.findByIdAndUpdate(body._id, {
                name: body.name,
                code: body.code,
                flag: body.flag,
                rtl: body.rtl
            });
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated language'
            });
        }
        else {
            await language_model_1.default.create({
                name: body.name,
                code: body.code,
                flag: body.flag,
                rtl: body.rtl
            });
            return res.status(200).send({
                error: false,
                msg: 'Successfully added language'
            });
        }
    }
    catch (e) {
        res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.postLanguage = postLanguage;
const delLanguage = async (req, res) => {
    try {
        const { query } = req;
        const deleteLang = await language_model_1.default.deleteOne({ _id: query._id });
        if (deleteLang?.deletedCount === 0)
            return res.status(404).json({
                error: true,
                msg: 'Delete failed'
            });
        return res.status(200).json({
            error: false,
            msg: 'Deleted successful'
        });
    }
    catch (e) {
        res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.delLanguage = delLanguage;
const getLanguageTranslations = async (req, res) => {
    try {
        const languages = await language_model_1.default.find({ active: true }, 'name code flag default translation rtl');
        return res.status(200).send({
            error: false,
            msg: 'Successfully gets Languages',
            data: languages?.map(d => ({
                ...d["_doc"],
                translation: d.translation?.reduce((acc, d) => {
                    acc[d.key] = d.value;
                    return acc;
                }, {})
            }))
        });
    }
    catch (error) {
        res.status(500).send({
            error: true,
            msg: 'Server failed'
        });
    }
};
exports.getLanguageTranslations = getLanguageTranslations;
const postLanguageTranslations = async (req, res) => {
    try {
        let { body } = req;
        for (const _id of Object.keys(body)) {
            await language_model_1.default.findByIdAndUpdate(_id, {
                translation: Object.keys(body[_id])?.map(key => ({ key: key, value: body[_id][key] }))
            });
        }
        return res.status(200).json({
            error: false,
            msg: 'Successfully updated translations'
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.postLanguageTranslations = postLanguageTranslations;
//# sourceMappingURL=settings.controller.js.map