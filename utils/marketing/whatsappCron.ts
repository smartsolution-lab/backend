import dotenv from 'dotenv';

dotenv.config();
import MarketingGroup from "../../models/marketing_group.model";
import {all} from "deepmerge";
import MarketingUser from "../../models/marketing_users.model";

import MarketingSettings from "../../models/marketing_setting.model";
import MarketingWhatsapp from "../../models/marketing_whatsapp.model";
import {sendWhatsappSms} from "./deliveryWhatsapp";

const cron = require('node-cron');
const nodemailer = require("nodemailer");

export const cornWhatsapp = async () => {
        let allMails = await MarketingWhatsapp.find({status: 'scheduled'}).populate("group")

        if (allMails) {
            allMails.map(async data => {
                    const serverTime = new Date();
                    // Set your scheduled time
                    const temp_time = String(data.scheduled_date)
                    const scheduledTime = new Date(temp_time);
                    // Compare the current server time with your scheduled time
                    if (serverTime >= scheduledTime) {
                        let to = data.to
                        let whatsapp = await MarketingWhatsapp.findById(data._id);
                        //handle whatsapp
                        sendWhatsappSms(
                            to,
                            data.content,
                        ).then((response) => {
                            // @ts-ignore
                            if (!!response) {
                                whatsapp.status = 'success'
                                whatsapp.save()
                            } else {
                                whatsapp.status = 'failed'
                                whatsapp.save()
                            }
                        })
                    }
                }
            )
        }
    }
;

