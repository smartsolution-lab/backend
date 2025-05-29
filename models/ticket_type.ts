import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const schema = new Schema({
        departments: [{
            type: Schema.Types.ObjectId,
            ref: 'ticket_department'
        }],
        categories: [{
            type: Schema.Types.ObjectId,
            ref: 'ticket_department'
        }],
        name: {
            type: String,
            unique: true
        },
        active: {
            type: Boolean,
            default: true
        }
    }, {timestamps: true}
);

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const TicketType = model('ticket_type', schema);

export default TicketType;

