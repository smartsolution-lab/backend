"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeFcmArray = exports.driverFcmArray = exports.userFcmArray = exports.allUserFcmArray = void 0;
const allUserFcmArray = [
    {
        $match: {
            fcm_token: {
                $exists: true
            }
        }
    }, {
        $project: { 'fcm_token': true }
    }, {
        $unwind: {
            path: "$fcm_token",
        }
    }, {
        $unset: ['_id']
    }, {
        $group: {
            _id: null, fcm_tokens: { $push: "$fcm_token" }
        }
    }, {
        $project: {
            _id: 0, fcm_tokens: 1
        }
    }
];
exports.allUserFcmArray = allUserFcmArray;
const userFcmArray = [
    {
        $match: {
            role: 'user',
            fcm_token: {
                $exists: true
            }
        }
    }, {
        $project: { 'fcm_token': true }
    }, {
        $unwind: {
            path: "$fcm_token",
        }
    }, {
        $unset: ['_id']
    }, {
        $group: {
            _id: null, fcm_tokens: { $push: "$fcm_token" }
        }
    }, {
        $project: {
            _id: 0, fcm_tokens: 1
        }
    }
];
exports.userFcmArray = userFcmArray;
const driverFcmArray = [
    {
        $match: {
            role: 'driver',
            fcm_token: {
                $exists: true
            }
        }
    }, {
        $project: { 'fcm_token': true }
    }, {
        $unwind: {
            path: "$fcm_token",
        }
    }, {
        $unset: ['_id']
    }, {
        $group: {
            _id: null, fcm_tokens: { $push: "$fcm_token" }
        }
    }, {
        $project: {
            _id: 0, fcm_tokens: 1
        }
    }
];
exports.driverFcmArray = driverFcmArray;
const employeeFcmArray = [
    {
        $match: {
            role: 'employee',
            fcm_token: {
                $exists: true
            }
        }
    }, {
        $project: { 'fcm_token': true }
    }, {
        $unwind: {
            path: "$fcm_token",
        }
    }, {
        $unset: ['_id']
    }, {
        $group: {
            _id: null, fcm_tokens: { $push: "$fcm_token" }
        }
    }, {
        $project: {
            _id: 0, fcm_tokens: 1
        }
    }
];
exports.employeeFcmArray = employeeFcmArray;
//# sourceMappingURL=aggretion.js.map