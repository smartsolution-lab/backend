import {Router} from 'express';
import {isDemoRequest, userAuth} from '../../auth';
import {
    getWithdraws,
    postWithdraw,
    delWithdraw,
    getWithdraw,
    updateWithdraw
} from '../../controllers/withdraw.controller';


const withdrawRoutes = Router();
withdrawRoutes.post('/', userAuth({isDriver: true}), postWithdraw);
withdrawRoutes.post('/update', userAuth({isAdmin: true}), updateWithdraw);
withdrawRoutes.get('/driver-list', userAuth({isDriver: true}), getWithdraws);
withdrawRoutes.get('/list', userAuth({isAdmin: true}), getWithdraws);
withdrawRoutes.get('/', userAuth({isAuth: true}), getWithdraw);

// getUserWalletShortInfo
withdrawRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delWithdraw);

export default withdrawRoutes;