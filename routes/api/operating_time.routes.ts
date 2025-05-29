import { Router } from 'express';
const operatingTimeRoutes = Router();

import {
    postOperatingTime, getOperatingTimes, delOperatingTime
} from '../../controllers/operating_time.controller';
import { userAuth } from '../../auth';
 
operatingTimeRoutes.post('/', userAuth({isAdmin: true}), postOperatingTime);
operatingTimeRoutes.get('/', getOperatingTimes);
operatingTimeRoutes.delete('/', userAuth({isAdmin: true}), delOperatingTime);


export default operatingTimeRoutes;