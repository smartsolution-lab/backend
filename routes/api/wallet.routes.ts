import {Router} from 'express';
import {isDemoRequest, userAuth} from '../../auth';
import {
    stripeWallet,
    paypalWallet,
    getWalletList,
    delWallet,
    getUserWalletShortInfo,
    getWalletTransactions,
    getWalletListApp, getWalletDepositList, flutterWaveWallet
} from '../../controllers/wallet.controller';


const walletRoutes = Router();
walletRoutes.post('/stripe', userAuth({isUser: true}), stripeWallet);
walletRoutes.post('/paypal', userAuth({isUser: true}), paypalWallet);
walletRoutes.post('/flutterwave', userAuth({isUser: true}), flutterWaveWallet);

walletRoutes.get('/deposit-list', userAuth({isAdmin: true}), getWalletDepositList);
walletRoutes.get('/list', userAuth({isUser: true}), getWalletList);
walletRoutes.get('/list-app', userAuth({isUser: true}), getWalletListApp);
walletRoutes.get('/user-wallet-brief', userAuth({isUser: true}), getUserWalletShortInfo);
walletRoutes.get('/user-transactions', userAuth({isUser: true}), getWalletTransactions);
walletRoutes.get('/user-transactions-app', userAuth({isUser: true}), getWalletTransactions);
// getUserWalletShortInfo
walletRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delWallet);

export default walletRoutes;