import Flutterwave from 'flutterwave-node-v3';
import Settings from "../models/settings.model";

export const getFlutterWaveTransaction = async (transactionId) => {
    try {
        const settings = await Settings.findOne({});
        const flw = new Flutterwave(settings?.flutterwave?.credentials?.public_key, settings?.flutterwave?.credentials?.secret_key);
        return await flw.Transaction.verify({ id: transactionId?.toString() });
    } catch (err) {
        return err
    }
}
