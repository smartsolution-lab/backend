import { Router } from 'express';
import { userAuth } from '../../auth';

import {
    postKnowledge_base,getKnowledge_base
} from '../../controllers/knowledge_base.controller';

const knowledge_baseRoutes = Router();

knowledge_baseRoutes.post('/', postKnowledge_base );
knowledge_baseRoutes.get('/', getKnowledge_base );






export default knowledge_baseRoutes;