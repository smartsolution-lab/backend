import LandingPage from '../models/landing_page.model';
import EarnWithShare from '../models/earn_with_share.model';
import mongoose from 'mongoose';
import ContactUsInfo from "../models/contact_us_info.model";

// post LandingPage
export const postLandingPage = async (req, res, next) => {
    try {
        const {body} = req;
        console.log(body)
        if (body._id) {
            await LandingPage.findByIdAndUpdate(body._id, {$set: body});
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        } else {
            delete body._id
            await LandingPage.create(req.body);
            return res.status(200).json({
                error: false,
                msg: 'Successfully created'
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}


// get LandingPage
export const getLandingPage = async (req, res, next) => {
    try {
        const frontendData = await LandingPage.findOne({});
        return res.status(200).json({
            error: false,
            data: frontendData
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}


// delete LandingPage
export const delLandingPage = async (req, res, next) => {
    try {
        const {query} = req;
        await LandingPage.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}


/**
 *
 * Earn with share
 */
export const postEarnWithShare = async (req, res, next) => {
    try {
        const {body} = req;
        if (body._id) {
            await EarnWithShare.findByIdAndUpdate(body._id, {$set: body});
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        } else {
            delete body._id
            await EarnWithShare.create(req.body);
            return res.status(200).json({
                error: false,
                msg: 'Successfully created'
            })
        }

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const getEarnWithShare = async (req, res, next) => {
    try {
        const frontendData = await EarnWithShare.findOne({});
        return res.status(200).json({
            error: false,
            data: frontendData
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const postContuctUsInfo = async (req, res, next) => {
    try {
        await ContactUsInfo.create(req.body)
        return res.status(200).json({
            error: false,
            msg: 'Message Received'
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}


