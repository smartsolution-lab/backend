"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.generateAccessToken = exports.getOrderDetails = void 0;
const settings_model_1 = __importDefault(require("../models/settings.model"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// for verify payment , calling that order 
const getOrderDetails = async (orderId) => {
    const settings = await settings_model_1.default.findOne({});
    const accessToken = await (0, exports.generateAccessToken)();
    const paypalUrl = process.env.paypal_base_url;
    const url = `${paypalUrl}/v2/checkout/orders/${orderId}`;
    const response = await (0, node_fetch_1.default)(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return (0, exports.handleResponse)(response);
};
exports.getOrderDetails = getOrderDetails;
// generate access token
const generateAccessToken = async () => {
    const settings = await settings_model_1.default.findOne({});
    const paypalUrl = process.env.paypal_base_url;
    const paypal_client_id = process.env.paypal_client_id;
    const paypal_secret_key = process.env.paypal_secret_key;
    const auth = Buffer.from(paypal_client_id + ":" + paypal_secret_key).toString("base64");
    const response = await (0, node_fetch_1.default)(`${paypalUrl}/v1/oauth2/token`, {
        method: "post",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });
    const jsonData = await (0, exports.handleResponse)(response);
    return jsonData.access_token;
};
exports.generateAccessToken = generateAccessToken;
const handleResponse = async (response) => {
    if (response.status === 200 || response.status === 201) {
        return response.json();
    }
    const errorMessage = await response.text();
    throw new Error(errorMessage);
};
exports.handleResponse = handleResponse;
//# sourceMappingURL=paypal-api.js.map