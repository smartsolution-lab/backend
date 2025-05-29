"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlutterWaveTransaction = void 0;
const flutterwave_node_v3_1 = __importDefault(require("flutterwave-node-v3"));
const settings_model_1 = __importDefault(require("../models/settings.model"));
const getFlutterWaveTransaction = async (transactionId) => {
    try {
        const settings = await settings_model_1.default.findOne({});
        const flw = new flutterwave_node_v3_1.default(settings?.flutterwave?.credentials?.public_key, settings?.flutterwave?.credentials?.secret_key);
        return await flw.Transaction.verify({ id: transactionId?.toString() });
    }
    catch (err) {
        return err;
    }
};
exports.getFlutterWaveTransaction = getFlutterWaveTransaction;
//# sourceMappingURL=flutterwave.js.map