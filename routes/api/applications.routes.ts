import { Router } from 'express';

import { userAuth } from '../../auth';
import {
    createApplication,
    getOneApplication,
    getAllApplication,
    updateApplication,
    deleteApplication,
    updateApplicationStatus
} from '../../controllers/applications.controller';


const applicationRoutes = Router();
applicationRoutes.post('/create', createApplication);
applicationRoutes.post('/update', updateApplication);
applicationRoutes.post('/update-status', updateApplicationStatus);
applicationRoutes.get('/get-all', getAllApplication);
applicationRoutes.get('/get-one', getOneApplication);
applicationRoutes.delete('/delete', userAuth({isAdmin: true}), deleteApplication);


export default applicationRoutes;