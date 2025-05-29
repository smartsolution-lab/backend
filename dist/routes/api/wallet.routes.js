"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const wallet_controller_1 = require("../../controllers/wallet.controller");
const walletRoutes = (0, express_1.Router)();
walletRoutes.post('/stripe', (0, auth_1.userAuth)({ isUser: true }), wallet_controller_1.stripeWallet);
walletRoutes.post('/paypal', (0, auth_1.userAuth)({ isUser: true }), wallet_controller_1.paypalWallet);
walletRoutes.post('/flutterwave', (0, auth_1.userAuth)({ isUser: true }), wallet_controller_1.flutterWaveWallet);
walletRoutes.get('/deposit-list', (0, auth_1.userAuth)({ isAdmin: true }), wallet_controller_1.getWalletDepositList);
walletRoutes.get('/list', (0, auth_1.userAuth)({ isUser: true }), wallet_controller_1.getWalletList);
walletRoutes.get('/list-app', (0, auth_1.userAuth)({ isUser: true }), wallet_controller_1.getWalletListApp);
walletRoutes.get('/user-wallet-brief', (0, auth_1.userAuth)({ isUser: true }), wallet_controller_1.getUserWalletShortInfo);
walletRoutes.get('/user-transactions', (0, auth_1.userAuth)({ isUser: true }), wallet_controller_1.getWalletTransactions);
walletRoutes.get('/user-transactions-app', (0, auth_1.userAuth)({ isUser: true }), wallet_controller_1.getWalletTransactions);
// getUserWalletShortInfo
walletRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, wallet_controller_1.delWallet);
exports.default = walletRoutes;
//# sourceMappingURL=wallet.routes.js.map