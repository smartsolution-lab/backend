import ServiceCategory from "../models/service_category.model";
import mongoose from "mongoose";
import Service from "../models/service.model";
import CategoryInfo from "../models/category_info.model";

export const postServiceCategory = async (req, res) => {
    try {
        let {body} = req;
        if (!!body._id) {
            await ServiceCategory.findOneAndUpdate({_id: body._id}, body)
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated category'
            })
        } else {
            delete body._id
            await ServiceCategory.create(body)
            return res.status(200).send({
                error: false,
                msg: 'Successfully added category'
            })
        }
    } catch (e) {
        if (e?.code === 11000) {
            return res.status(406).send({
                error: true,
                msg: 'Category name already exists',
            })
        }
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchServiceCategory = async (req, res, next) => {
    try {
        const {query} = req;
        const category = await ServiceCategory.findOne({_id: new mongoose.Types.ObjectId(query._id)});
        return res.status(200).json({
            error: false,
            data: category
        })
    } catch (error) {
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchServiceCategories = async (req, res, next) => {
    try {
        const {query} = req
        // @ts-ignore
        let data = await ServiceCategory.aggregatePaginate(ServiceCategory.aggregate([
            ...(!!query.search ? [
                {
                    $match: {
                        $or: [
                            {name: {$regex: new RegExp(query.search.toLowerCase(), "i")}},
                        ]
                    }
                }
            ] : []),
        ]), {
            page: query.page || 1,
            limit: query.size || 10,
            sort: {createdAt: -1},
        })
        return res.status(200).send({
            error: false,
            msg: 'Successfully get categories',
            data
        })

    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchServiceCategoriesForApp = async (req, res, next) => {
    try {
        const {query} = req
        // @ts-ignore
        let data = await ServiceCategory.find();
        return res.status(200).send({
            error: false,
            msg: 'Successfully get categories',
            data: {
                categories: data
            }
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const getServiceCategoryElements = async (req, res) => {
    try {
        let {query} = req
        let filter: any = {parent: {$exists: false}}
        if (query.parent) {
            filter.parent = new mongoose.Types.ObjectId(query.parent)
        }
        let data = await ServiceCategory.find(filter, 'name');
        return res.status(200).send({
            error: false,
            msg: 'Successfully get categories',
            data
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchAllServicesInDetails = async (req, res, next) => {
    try {
        const {query} = req;
        const vehicle = await ServiceCategory.aggregate([
            {
                $lookup: {
                    from: 'services',
                    let: {"category": "$_id"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$$category", "$categories"]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                image: 1
                            }
                        }
                    ],
                    as: 'services'
                }
            },
            {
                $project: {
                    name: 1,
                    image: 1,
                    services: 1
                }
            }
        ])
        return res.status(200).json({
            error: false,
            data: vehicle
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const delServiceCategory = async (req, res, next) => {
    try {
        const {query} = req;
        await ServiceCategory.findByIdAndDelete(query._id);
        await CategoryInfo.deleteMany({service_category: new mongoose.Types.ObjectId(query._id)})
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

// category info
export const postCategoryInfo = async (req, res, next) => {
    try {
        const {body} = req;
        if (!!body._id) {
            await CategoryInfo.updateOne({service_category: body.service_category}, {$set: {...body}})
            return res.status(200).send({
                error: false,
                msg: "Updated successfully"
            })
        }
        delete body._id
        await CategoryInfo.create({
            ...body
        });
        return res.status(200).send({
            error: false,
            msg: "Information added"
        })
    } catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        })
    }
}

// CategoryInfo information
export const getCategoryInfo = async (req, res, next) => {
    try {
        const {query} = req;
        const info = await CategoryInfo.aggregate([
            {
                $match: {
                    service_category: new mongoose.Types.ObjectId(query.service_category)
                }
            },
            {
                $project: {
                    brief_info: "$brief_info",
                    service_category: "$service_category",
                }
            }
        ])
        return res.status(200).send({
            error: false,
            data: info[0]
        })
    } catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        })
    }
}

export const delCategoryInfo = async (req, res, next) => {
    try {
        await CategoryInfo.findByIdAndDelete(req.query.id);
        return res.status(200).send({
            error: false,
            msg: "Deleted successfully"
        })
    } catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        })
    }
}

// heading info
export const postCategoryHeading = async (req, res, next) => {
    try {
        const {body} = req;
        console.log(body)
        if (!!body._id) {
            await CategoryInfo.updateOne({_id: body._id}, {
                $set: {
                    section_title: body.section_title,
                    section_sub_title: body.section_sub_title,
                }
            })
            return res.status(200).send({
                error: false,
                msg: "Updated successfully"
            })
        }
        delete body._id
        await CategoryInfo.create({
            section_title: body.section_title,
            section_sub_title: body.section_sub_title,
            heading: true
        });
        return res.status(200).send({
            error: false,
            msg: "Information added"
        })
    } catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        })
    }
}

export const getCategoryHeading = async (req, res, next) => {
    try {
        const {query} = req;
        const heading = await CategoryInfo.aggregate([
            {
                $match: {
                    heading: true
                }
            },
            {
                $project: {
                    section_title: 1,
                    section_sub_title: 1,
                }
            }
        ])
        return res.status(200).send({
            error: false,
            data: heading[0]
        })
    } catch (error) {
        return res.status(500).send({
            error: true,
            msg: error.message
        })
    }
}