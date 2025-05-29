import ServicePackage from '../models/service_package.model';
import mongoose from "mongoose";

// post ServicePackage
export const postServicePackage = async (req, res, next) => {
    try {
        const {body} = req;
        const {user} = res.locals;
        if (!!body._id) {
            await ServicePackage.findByIdAndUpdate(body._id, {$set: body});
            return res.status(200).json({
                error: false,
                msg: 'Successfully updated'
            });
        }
        delete body._id;
        const response = await ServicePackage.create({...body});
        return res.status(200).json({
            error: false,
            msg: 'Successfully created!',
            data: response
        })
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({
                error: true,
                msg: 'Duplicate warning!'
            })
        }
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}


export const getServicePackages = async (req, res, next) => {
    try {
        const {query} = req;
        let filter: any = {};
        if (query.search) {
            filter = {
                $or: [
                    {"name": {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                ]
            }
        }
        // @ts-ignore
        const servicePackages = await ServicePackage.aggregatePaginate(ServicePackage.aggregate([
            {$match: filter},
            {$sort: {createdAt: -1}}
        ]), {
            page: query.page || 1,
            limit: query.size || 20,
        });
        return res.status(200).json({
            error: false,
            data: servicePackages
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

export const getServicePackage = async (req, res, next) => {
    try {
        const {query} = req;

        const servicePackage = await ServicePackage.findOne({_id: new mongoose.Types.ObjectId(query._id)})
        return res.status(200).json({
            error: false,
            data: servicePackage
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}

// delete ServicePackage
export const delServicePackage = async (req, res, next) => {
    try {
        const {query} = req;
        await ServicePackage.findByIdAndDelete(query._id);
        return res.status(200).json({
            error: false,
            msg: "Deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: "Server side error"
        })
    }
}