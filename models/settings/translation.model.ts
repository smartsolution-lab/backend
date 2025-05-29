import mongoose, {Schema} from "mongoose";
import Language from "../language.model";

const translationSchema = new Schema({
    label: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    key: {
        type: String,
        required: true,
        unique: true
    },
    direction: {
        type: String,
        required: true
    },
    translation: [{
        key: String,
        value: String
    }]
});


const Translation = mongoose.model('Translation', translationSchema);
export default Translation;