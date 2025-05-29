import Ticket from "../models/knowledgebase.model";
import KnowledgeBase from "../models/knowledgebase.model";
import TicketPriorities from "../models/ticket_priority";

function omit(key, obj) {
    const {[key]: omitted, ...rest} = obj;
    return rest;
}

export const postKnowledge_base = async (req, res) => {
    const {body} = req;

    try {

        if (req.body._id === '') {
            omit('_id', body);
            await KnowledgeBase.create(body)
            return res.status(200).send({
                error: false,
                msg: "Successfully Created"
            })
        } else {
            await KnowledgeBase.findByIdAndUpdate({_id: body._id}, body);
            return res.status(200).send({
                error: false,
                msg: "data Updated"
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            error: true,
            msg: "server error"
        })
    }


}
export const getKnowledge_base = async (req, res) => {
    console.log("here...");
    const {query} = req
    if (!!query._id) {
        const data = await KnowledgeBase.findById(query._id)
        return res.status(200).send({
            error: false,
            msg: "Fetch Successful",
            data: data
        })
    } else {
        try {
            const data = await KnowledgeBase.find()
            return res.status(200).send({
                error: false,
                msg: "Fetch Successful",
                data: data
            })
        } catch (err) {
            return res.status(500).send({
                error: true,
                msg: "Server failed"
            })
        }
    }

}


