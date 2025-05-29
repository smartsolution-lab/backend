import {Router} from 'express';
import {userAuth} from '../../auth';

import {
    postNotification,
    getNotification,
    updateNotification,
    getAllNotification
} from "../../controllers/notification.controller";

const Notification = Router();
Notification.get('/',userAuth({isAuth: true}), getNotification );
Notification.get('/all-notification',userAuth({isAuth: true}), getAllNotification );
Notification.post('/', postNotification );
Notification.post('/update', updateNotification );

export default Notification;

