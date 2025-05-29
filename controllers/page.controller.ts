import Page from "../models/page.model";

export const getPage = async (req, res) => {
    try {
        const {query} = req
        let page = await Page.findOne({page: query?.pages})
        if (!!page) {
            return res.status(200).send({
                error: false,
                msg: "Successfully get page",
                data: {
                    ...page["_doc"],
                    content: page.content?.filter(d => (query?.lang === d.lang)).reduce((acc, item) => {
                        acc[item.key] = {
                            type: item.type,
                            value: item.type === "object" ? JSON.parse(item.value) : item.value
                        }
                        return acc
                    }, {})
                },
            })
        }
        return res.status(404).send({
            error: true,
            msg: "Page not found",
        })
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            error: true,
            msg: "Server failed"
        })
    }
}

export const getAppPage = async (req, res) => {
    try {
        const {query} = req
        let page = await Page.aggregate([
            {
                $match: {
                    page: query.page,
                }
            },
            {$unwind: {path: "$content", preserveNullAndEmptyArrays: true}},
            {
                $match: {
                    'content.lang': query.lang,
                }
            },
        ])
        const plainData = JSON.parse(page[0].content.value || '')
        return res.status(200).send({
            error: false,
            data: page?.length > 0 ? plainData : "Page not found"
        })
    } catch (err) {
        return res.status(500).send({
            error: true,
            msg: "Server failed"
        })
    }
}

export const getAppPageContactUse = async (req, res) => {
    try {
        const {query} = req
        let page = await Page.aggregate([
            {
                $match: {
                    page: query.page,
                }
            },
            {$unwind: {path: "$content", preserveNullAndEmptyArrays: true}},
            {
                $match: {
                    'content.lang': query.lang,
                }
            },
        ])
        const plainData = JSON.parse(page[0].content.value || '')
        return res.status(200).send({
            error: false,
            data: page?.length > 0 ? {
                emails: plainData?.email?.value,
                phones: plainData?.phone?.value,
                basic_info: plainData?.contact?.value,
                address: plainData?.map?.value,
            } : "Page not found"
        })
    } catch (err) {
        return res.status(500).send({
            error: true,
            msg: "Server failed"
        })
    }
}

export const getCustomPage = async (req, res) => {
    try {
        let pages = await Page.find({type: 'custom'}, 'title page')
        return res.status(200).send({
            error: false,
            msg: "Pages",
            data: pages
        })
    } catch
        (err) {
        return res.status(500).send({
            error: true,
            msg: "Server failed"
        })
    }
}
export const delPage = async (req, res) => {
    const {query} = req
    const {params} = req
    const {body} = req
    console.log(query, params, body)
    try {
        if (query.page) {
            await Page.deleteOne({page: query?.page})
            return res.status(200).send({
                error: false,
                msg: "Page Deleted"
            })
        }
        await Page.deleteOne({_id: query?._id})
        return res.status(200).send({
            error: false,
            msg: "Page Deleted"
        })
    } catch
        (err) {
        return res.status(500).send({
            error: true,
            msg: "Server failed"
        })
    }
}

export const postPage = async (req, res) => {
    try {
        const {body} = req
        console.log(body)

        let find = await Page.findOne({page: body?.page})
        if (!!find) {
            if (!!body.title) {
                find.title = body.title
            }
            Object.keys(body.content || {}).forEach(key => {
                let content = find.content.find(content => (content.key === key && content.lang === body.content[key].lang))
                if (!!content) {
                    content.type = body.content[key].type === 'object' ? 'object' : 'string'
                    content.value = body.content[key].type === 'object' ? JSON.stringify(body.content[key].value) : body.content[key].value.toString()
                } else {
                    find.content.push({
                        type: body.content[key].type === 'object' ? 'object' : 'string',
                        key: key,
                        value: body.content[key].type === 'object' ? JSON.stringify(body.content[key].value) : body.content[key].value.toString(),
                        lang: body.content[key].lang
                    })
                }
            })
            await find.save()
            return res.status(200).send({
                error: false,
                msg: "Successfully updated page",
            })
        } else {
            await Page.create({
                page: body?.page,
                title: body?.title,
                type: body?.type || null,
                content: Object.keys(body.content || {}).map(key => {
                    return {
                        type: body.content[key].type === 'object' ? 'object' : 'string',
                        key: key,
                        value: body.content[key].type === 'object' ? JSON.stringify(body.content[key].value) : body.content[key].value.toString(),
                        lang: body.content[key].lang
                    }
                })
            })
            return res.status(200).send({
                error: false,
                msg: "Successfully created page",
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            error: true,
            msg: "Server failed"
        })
    }
}
