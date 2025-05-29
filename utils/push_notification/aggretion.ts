const allUserFcmArray = [
    {
    $match: {
        fcm_token: {
            $exists: true
        }
    }
}, {
    $project: {'fcm_token': true}
}, {
    $unwind: {
        path: "$fcm_token",
    }
}, {
    $unset: ['_id']
}, {
    $group: {
        _id: null, fcm_tokens: {$push: "$fcm_token"}
    }
}, {
    $project: {
        _id: 0, fcm_tokens: 1
    }
}]
const userFcmArray = [
    {
    $match: {
        role:'user',
        fcm_token: {
            $exists: true
        }
    }
}, {
    $project: {'fcm_token': true}
}, {
    $unwind: {
        path: "$fcm_token",
    }
}, {
    $unset: ['_id']
}, {
    $group: {
        _id: null, fcm_tokens: {$push: "$fcm_token"}
    }
}, {
    $project: {
        _id: 0, fcm_tokens: 1
    }
}]
const driverFcmArray = [
    {
    $match: {
        role:'driver',
        fcm_token: {
            $exists: true
        }
    }
}, {
    $project: {'fcm_token': true}
}, {
    $unwind: {
        path: "$fcm_token",
    }
}, {
    $unset: ['_id']
}, {
    $group: {
        _id: null, fcm_tokens: {$push: "$fcm_token"}
    }
}, {
    $project: {
        _id: 0, fcm_tokens: 1
    }
}]

const employeeFcmArray = [
    {
    $match: {
        role:'employee',
        fcm_token: {
            $exists: true
        }
    }
}, {
    $project: {'fcm_token': true}
}, {
    $unwind: {
        path: "$fcm_token",
    }
}, {
    $unset: ['_id']
}, {
    $group: {
        _id: null, fcm_tokens: {$push: "$fcm_token"}
    }
}, {
    $project: {
        _id: 0, fcm_tokens: 1
    }
}]

export {allUserFcmArray,userFcmArray,driverFcmArray,employeeFcmArray}
