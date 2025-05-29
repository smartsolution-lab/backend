import {Router} from 'express';
import {userAuth} from '../../auth';
import {
    messageSend,
    messages,
    deleteMsg
} from '../../controllers/chatting.controller';


const chattingRoutes = Router();
chattingRoutes.post('/', userAuth({isAuth: true}), messageSend);
chattingRoutes.get('/list', userAuth({isAuth: true}), messages);
chattingRoutes.delete('/', userAuth({isAdmin: true}), deleteMsg);

export default chattingRoutes;