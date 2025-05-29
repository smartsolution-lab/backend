import {model, Schema} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

let schema = new Schema({
        hero: {
            title: String,
            description: String,
            image: String
        },
        hero_section_banners: [],
        work: {
            work_title: String,
            work_description: String,
            work_card: [
                {
                    icon: String,
                    heading: String,
                    paragraph: String,
                    focus: Boolean
                }
            ]
        },
        statistics: {
            description_1st: String,
            data_1st: String,
            data_2nd: String,
            data_3rd: String,
            data_4th: String,
            description_2nd: String,
            description_3rd: String,
            description_4th: String,
        },
        benifit: {
            image1: String,
            middle_card_titile: String,
            middle_card_description: String,
            image2: String,
            left_card_titile: String,
            left_card_description: String,
            image3: String,
            right_card_titile: String,
            right_card_description: String,
        },

    }, {timestamps: true}
)

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const LandingPage = model('landing_page', schema)
export default LandingPage