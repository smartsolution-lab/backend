import { Router } from 'express';
const leaveSettingsRoutes = Router();

import {
    postLeaveSetting, getLeaveSetting, delLeaveSetting
} from '../../controllers/leave_setting.controller';
import { userAuth } from '../../auth';


// post 
leaveSettingsRoutes.post('/', userAuth({isAdmin: true}), postLeaveSetting);
// get
leaveSettingsRoutes.get('/', getLeaveSetting);
// delete
leaveSettingsRoutes.delete('/', userAuth({isAdmin: true}), delLeaveSetting);


export default leaveSettingsRoutes;