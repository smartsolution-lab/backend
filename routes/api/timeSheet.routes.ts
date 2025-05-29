import { Router } from 'express';
const timeSheetRoutes = Router();

import {
    getTimeSheet
} from '../../controllers/timeSheet.controller';
import { userAuth } from '../../auth';


// get
timeSheetRoutes.get('/', getTimeSheet);


export default timeSheetRoutes;