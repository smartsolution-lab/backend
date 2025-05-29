import mongoose from 'mongoose';
import OperatingTime from '../models/operating_time.model';


// post OperatingTime
export const postOperatingTime = async (req, res, next) => {
    try {
        const { body } = req;
        if (body._id) {
            await OperatingTime.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });

        } else {
            await OperatingTime.create({
                day: body.day,
                opening_time: body.opening_time,
                closing_time: body.closing_time,
                status: body.status,
                manager: body.manager,
                restaurant: body.restaurant,
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            })
        }

    } catch (error) {
        console.log("🚀 ~ file: operating_time.controller.ts:32 ~ postOperatingTime ~ error", error)
        if (error?.code === 11000) {
            return res.status(400).json({
                error: true,
                msg: 'Duplicate warning!'
            })
        }
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}


// get OperatingTime
export const getOperatingTimes = async (req, res, next) => {
    try {
        const { query } = req;
        let filter: any = {};
        // @ts-ignore
        const operatingTime = await OperatingTime.aggregate([
            // {
            //     $match: {
            //         restaurant: new mongoose.Types.ObjectId(query.restaurant)
            //     }
            // },
            { $match: filter },
        ]);

        return res.status(200).json({
            error: false,
            data: operatingTime
        });


    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}


// delete OperatingTime
export const delOperatingTime = async (req, res, next) => {
    try {
        const { query } = req;

        await OperatingTime.findByIdAndDelete(query._id);
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

