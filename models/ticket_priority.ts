import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const schema = new Schema({
        name: {
            type: String,
            unique: true
        },
        value: String,
        active: {
            type: Boolean,
            default: true
        }
    }, {timestamps: true}
);

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const TicketPriority = model('ticket_priority', schema);

export default TicketPriority;

