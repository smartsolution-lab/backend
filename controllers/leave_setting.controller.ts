import LeaveSetting from '../models/leave_setting.model';

// post LeaveSetting
export const postLeaveSetting = async (req, res, next) => {
    try {
        const { body } = req;
        if (body._id) {
            await LeaveSetting.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });

        } else {
            await LeaveSetting.create({
                title: body.title,
                days: body.days,
                type: body.type,
                icon: body.icon
            });
            return res.status(200).json({
                error: false,
                msg: 'Successfully created!'
            })
        }


    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({
                error: true,
                msg: 'Duplicate warning!'
            })
        }
        return res.status(500).json({
            error: true,
            msg: "An error occurred!"
        })
    }
}


// get LeaveSetting
export const getLeaveSetting = async (req, res, next) => {
    try {
        const { query } = req;
        let filter: any = {};

        if (query._id) {
            const leaveSetting = await LeaveSetting.findById(query._id);
            return res.status(200).json({
                error: false,
                data: leaveSetting
            })

        } else {
            if (query.search) {
                filter = {
                    $or: [
                        { name: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                        { status: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    ]
                }
            };
            // @ts-ignore
            const leaveSetting = await LeaveSetting.aggregatePaginate(LeaveSetting.aggregate([
                { $match: filter },
                { $sort: { createdAt: -1 } }
            ]),{
                page: query.page || 1,
                limit: query.size || 10,
            });
            return res.status(200).json({
                error: false,
                data: leaveSetting
            });
        };

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}


// delete LeaveSetting
export const delLeaveSetting = async (req, res, next) => {
    try {
        const { query } = req;

        await LeaveSetting.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}