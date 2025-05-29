import {Router} from 'express';
import {isDemoRequest, userAuth} from '../../auth';

import {
    postFormFiled, getAll, deleteField
} from '../../controllers/form_fields.controller';

const formFieldRoutes = Router();
formFieldRoutes.post('/', userAuth({isAdmin: true}), isDemoRequest, postFormFiled);
formFieldRoutes.get('/list', getAll);
formFieldRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, deleteField);

export default formFieldRoutes;