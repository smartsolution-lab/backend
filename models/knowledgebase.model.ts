import {model, Schema, SchemaType} from 'mongoose'
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'


const schema = new Schema({

        title: String,
        descriptions: String,

    }, {timestamps: true}
);

schema.plugin(paginate)
schema.plugin(aggregatePaginate)
const KnowledgeBase = model('knowledge_base', schema);

export default KnowledgeBase;

