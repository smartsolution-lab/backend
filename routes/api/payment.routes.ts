import {Router} from 'express';
import {isDemoRequest, userAuth} from '../../auth';

import {
    getPaymentList,
    getPayment,
    delPayment,
    walletPayment,
    stripePayment,
    paypalPayment,
    molliePaymentGetaway,
    molliePaymentCheck,
    razorPayPayment,
    razorPayVerification,
    driverBalanceList, checkPayment, deleteDriverBalance, flutterWavePayment
} from '../../controllers/payment.controller';

const paymentRoutes = Router();
paymentRoutes.post('/wallet', userAuth({isUser: true}), walletPayment);
paymentRoutes.post('/stripe', userAuth({isUser: true}), stripePayment);
paymentRoutes.post('/paypal', userAuth({isUser: true}), paypalPayment);
paymentRoutes.post('/mollie-payment', userAuth({isUser: true}), molliePaymentGetaway);
paymentRoutes.get('/webhook', molliePaymentCheck);
paymentRoutes.post('/razorpay', userAuth({isUser: true}), razorPayPayment);
paymentRoutes.post('/razorpay-verify', userAuth({isUser: true}), razorPayVerification);
paymentRoutes.post('/flutterwave', userAuth({isUser: true}), flutterWavePayment);

paymentRoutes.get('/list', userAuth({isAdmin: true}), getPaymentList);
paymentRoutes.get('/list-user', userAuth({isUser: true}), getPaymentList);
paymentRoutes.get('/list-driver', userAuth({isDriver: true}), getPaymentList);
paymentRoutes.get('/', getPayment);
paymentRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delPayment);

paymentRoutes.get('/check', checkPayment);

paymentRoutes.get('/driver-balance-list', userAuth({isAuth: true}), driverBalanceList);
paymentRoutes.delete('/driver-balance', userAuth({isAdmin: true}), isDemoRequest, deleteDriverBalance);


export default paymentRoutes;