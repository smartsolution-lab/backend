"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocoder = void 0;
const NodeGeocoder = require('node-geocoder');
const options = {
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
exports.geocoder = NodeGeocoder(options);
//# sourceMappingURL=geo_coder.js.map