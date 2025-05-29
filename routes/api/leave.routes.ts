import { Router } from 'express';
const leaveRoutes = Router();

import {
    postLeave, getLeave, delLeave
} from '../../controllers/leave.controller';
import { userAuth } from '../../auth';


// post 
leaveRoutes.post('/', userAuth({isAdmin: true}), postLeave);
// get
leaveRoutes.get('/', getLeave);
// delete
leaveRoutes.delete('/', userAuth({isAdmin: true}), delLeave);


export default leaveRoutes;