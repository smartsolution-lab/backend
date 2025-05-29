import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

let schema = new Schema({
    name: String,
    first_name: String,
    middle_name: String,
    last_name: String,
    username: {
        type: String,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
    },
    fax: {
        type: String,
        trim: true
    },
    birthday: Date,
    joining_date: Date,
    id_number: String,
    department: {
        type: Schema.Types.ObjectId,
        ref: 'department',
    },
    permission: {
        type: Schema.Types.ObjectId,
        ref: 'role',
    },
    country: String,
    city: String,
    area: String,
    street: String,
    building: String,
    gender: String,
    door: String,
    address1: String,
    address2: String,
    state: String,
    postcode: String,
    image: String,
    otp: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'driver', 'employee'],
    },
    marketing_status: {
        type: String,
        default: 'active',
        enum: ['active', 'banned']
    },
    verified: {
        type: Boolean,
        default: false,
    },
    active: {
        type: Boolean,
        default: false,
    },
    vehicle: {type: Schema.Types.ObjectId, ref: 'vehicle'},
    balance: Number,
    key: {
        type: String,
        trim: true
    },
    ticket_departments: [{
        type: Schema.Types.ObjectId,
        ref: 'ticket_department',
    }],
    ticket_categories: [{
        type: Schema.Types.ObjectId,
        ref: 'ticket_department',
    }],
    ticket_types: [{
        type: Schema.Types.ObjectId,
        ref: 'ticket_type',
    }],
    assigned_ticket: {
        type: [{ type: Schema.Types.ObjectId, ref: 'ticket' }],
        default: []
    },
    fcm_token: [String],
    push_notification_status:{
        type: Boolean,
        default: true,
    }

}, {timestamps: true})


schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const User = model('user', schema)

export default User
