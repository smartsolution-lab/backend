import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const schema = new Schema({
        name: {
            type: String,
            unique: true
        },
        active: {
            type: Boolean,
            default: true
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'ticket_department',
        }
    }, {timestamps: true}
);

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const TicketDepartment = model('ticket_department', schema);

export default TicketDepartment;

