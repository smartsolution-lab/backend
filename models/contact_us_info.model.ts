import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'


// schema design
const schema = new Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    message: {
        type: String,
    },

});


schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const ContactUsInfo = model("contact_us_info)", schema);

export default ContactUsInfo;