import { Router } from 'express';
const holidayRoutes = Router();

import {
    postHoliday, getHoliday, delHoliday
} from '../../controllers/holiday.controller';
import { userAuth } from '../../auth';


// post 
holidayRoutes.post('/', userAuth({isAdmin: true}), postHoliday);
// get
holidayRoutes.get('/', getHoliday);
// delete
holidayRoutes.delete('/', userAuth({isAdmin: true}), delHoliday);


export default holidayRoutes;