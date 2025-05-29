import mongoose from "mongoose";
import Blog from "../models/blog.model";
import BlogCategory from "../models/service_category.model";

export const postBlog = async (req, res) => {
    try {
        let {body} = req
        if (!!body._id) {
            await Blog.findOneAndUpdate({_id: body._id}, body)
            return res.status(200).send({
                error: false,
                msg: 'Successfully updated blog'
            })
        } else {
            delete body._id
            await Blog.create(body)
            return res.status(200).send({
                error: false,
                msg: 'Successfully created'
            })
        }
    } catch (e) {

        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchBlogs = async (req, res, next) => {
    try {
        const {query} = req;
        let filter: any = {lang: query.lang,type:query.type}

        // @ts-ignore
        const data = await Blog.aggregatePaginate(Blog.aggregate([
            {$match: filter},
        ]), {
            page: query.page || 1,
            limit: query.size || 10,

            sort: {createdAt: -1},
        })

        if (data?.docs?.length === 0) return res.status(404).json({error: true, msg: "data not found"})

        return res.status(200).send({
            error: false,
            data: data
        })

    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const fetchBlog = async (req, res, next) => {
    try {
        const getRole = await Blog.findOne({_id: req.query._id});

        if (!getRole) return res.status(404).json({error: true, msg: "Blog not found"})

        return res.status(200).send({
            error: false,
            data: getRole
        })

    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: 'Server failed'
        })
    }
}

export const delBlog = async (req, res, next) => {
    try {

        const {query} = req;
        console.log("a......................")
        await Blog.findByIdAndDelete(query._id);
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
