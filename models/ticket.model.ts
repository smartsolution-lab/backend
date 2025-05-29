import {model, Schema, SchemaType} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const schema = new Schema({
        assign_to: Schema.Types.ObjectId,
        status: {
            type: String,
            enum: ['pending', 'open', 'closed'],
            default: 'pending'
        },
        answered: {
            type: Boolean,
            default: false
        },
        name: String,
        email: String,
        subject: String,
        body: String,
        department: Schema.Types.ObjectId,
        category: Schema.Types.ObjectId,
        type: Schema.Types.ObjectId,
        priorities: Schema.Types.ObjectId,

        notes: {
            type: [
                {
                    title: String,
                    description: String,
                    user: {
                        type: Schema.Types.ObjectId,
                        ref: 'user'
                    },
                    createdTime: {
                        type: Date,
                        default: Date.now
                    }
                },
            ],
            default: []
        },
        files: [],
        created_by: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },

        assigned_to: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },


        messages: {
            type: [
                {
                    message: String,
                    user: {
                        type: Schema.Types.ObjectId,
                        ref: 'user'
                    },
                    createdTime: {
                        type: Date,
                        default: Date.now
                    }
                },
            ],
            default: []
        },
    }, {timestamps: true}
);


schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const Ticket = model('ticket', schema);

export default Ticket;

