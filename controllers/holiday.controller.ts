import Holiday from '../models/holiday.model';

// post Holiday
export const postHoliday = async (req, res, next) => {
    try {
        const { body } = req;
        if (body._id) {
            await Holiday.findByIdAndUpdate(body._id, { $set: body });
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });

        } else {
            await Holiday.create({
                title: body.title,
                start_date: body.start_date,
                end_date: body.end_date,
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


// get Holiday
export const getHoliday = async (req, res, next) => {
    try {
        const { query } = req;
        let filter: any = {};

        if (query._id) {
            const holiday = await Holiday.findById(query._id);
            return res.status(200).json({
                error: false,
                data: holiday
            })

        } else {
            if (query.search) {
                filter = {
                    $or: [
                        { title: { $regex: new RegExp(query.search.toLowerCase(), "i") } },
                    ]
                }
            };
            // @ts-ignore
            const holiday = await Holiday.aggregatePaginate(Holiday.aggregate([
                { $match: filter },
                { $sort: { createdAt: -1 } }
            ]),{
                page: query.page || 1,
                limit: query.size || 10,
            });
            
            return res.status(200).json({
                error: false,
                data: holiday
            });
        };

    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: error.message
        })
    }
}


// delete Holiday
export const delHoliday = async (req, res, next) => {
    try {
        const { query } = req;

        await Holiday.findByIdAndDelete(query._id);
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