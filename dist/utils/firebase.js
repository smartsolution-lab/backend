"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { initializeApp, cert, } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const firebase_json_1 = __importDefault(require("./firebase.json"));
const firebaseAdmin = initializeApp({
    credential: cert(firebase_json_1.default),
});
exports.default = firebaseAdmin;
//# sourceMappingURL=firebase.js.map