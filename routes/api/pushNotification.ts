import {Router} from 'express';
import {userAuth} from '../../auth';


import {
    postNotification,
    getNotification,
    SettingJon,
    postNotificationStatus, getNotificationStatus
} from "../../controllers/push_notification.controller";

const pushNotification = Router();
pushNotification.get('/', getNotification);
pushNotification.post('/', postNotification);

pushNotification.get('/status',userAuth({isAuth:true}), getNotificationStatus);
pushNotification.post('/status',userAuth({isAuth:true}), postNotificationStatus);

pushNotification.post('/SettingJon',  SettingJon);
export default pushNotification;