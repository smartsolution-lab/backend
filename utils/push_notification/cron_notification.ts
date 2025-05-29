import dotenv from 'dotenv';

dotenv.config();

import PushNotification from "../../models/push_notificatio.model";
import User from "../../models/user.model";
import {allUserFcmArray, driverFcmArray, employeeFcmArray, userFcmArray} from "./aggretion";
import {sendNotification} from "./push";


export const cornNotification = async () => {
    let allNotifications = await PushNotification.find({status: 'scheduled'})

    if (allNotifications) {
        allNotifications.map(async data => {
            const serverTime = new Date();
            // Set your scheduled time
            const temp_time = String(data.scheduled_date)
            const scheduledTime = new Date(temp_time);
            // Compare the current server time with your scheduled time
            if (serverTime >= scheduledTime) {

                if (data.to_users === 'all_user') {
                    const tokens = await User.aggregate(allUserFcmArray)
                    const fcm_tokens = tokens[0].fcm_tokens

                    fcm_tokens.map(async (token) => {
                        // @ts-ignore
                        // @ts-ignore
                        const response = await sendNotification(token, data.title, data.body)

                        // if (response) {
                        //     console.log('Successfully sent message');
                        // } else {
                        //     console.log('Error sending message');
                        // }
                    })


                    // @ts-ignore
                    await PushNotification.findByIdAndUpdate(data._id, {status: 'sent'})


                } else if (data.to_users === 'driver') {

                    const data = await User.aggregate(driverFcmArray)
                    const fcm_tokens = data[0].fcm_tokens
                    fcm_tokens.map(async (token) => {
                        // @ts-ignore
                        const response = await sendNotification(token, data.title, data.body)
                        if (response) {
                        } else {
                        }
                    })

                    // @ts-ignore
                    await PushNotification.findByIdAndUpdate(data._id, {status: 'sent'})

                } else if (data.to_users === 'user') {

                    const data = await User.aggregate(userFcmArray)
                    const fcm_tokens = data[0].fcm_tokens
                    fcm_tokens.map(async (token) => {
                        // @ts-ignore
                        const response = await sendNotification(token, data.title, data.body)
                        if (response) {
                        } else {
                        }
                    })

                    // @ts-ignore
                    await PushNotification.findByIdAndUpdate(data._id, {status: 'sent'})
                } else if (data.to_users === 'employee') {

                    const data = await User.aggregate(employeeFcmArray)
                    const fcm_tokens = data[0].fcm_tokens
                    fcm_tokens.map(async (token) => {
                        // @ts-ignore
                        const response = await sendNotification(token, data.title, data.body)
                        if (response) {
                            console.log('Successfully sent message');
                        } else {
                            console.log('Error sending message');
                        }
                    })

                    // @ts-ignore
                    await PushNotification.findByIdAndUpdate(data._id, {status: 'sent'})

                }
            }
        })
    }
}



