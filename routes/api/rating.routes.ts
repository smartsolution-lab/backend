import {Router} from 'express';

import {userAuth} from '../../auth';
import {
    getDriverRatings, postDriverRating, delDriverRating,
    tipsThroughWallet, tipsThroughStripe, tipsThroughPaypal,
    tipsThroughMollie, tipsThroughMollieCheck
} from '../../controllers/rating.controller';


const ratingRoutes = Router();
ratingRoutes.post('/driver', userAuth({isAuth: true}), postDriverRating);
ratingRoutes.get('/driver/list', getDriverRatings);
ratingRoutes.get('/list', getDriverRatings);
ratingRoutes.delete('/', userAuth({isAdmin: true}), delDriverRating);

// tips and review
ratingRoutes.post('/driver/tips-wallet', userAuth({isAuth: true}), tipsThroughWallet);
ratingRoutes.post('/driver/tips-stripe', userAuth({isAuth: true}), tipsThroughStripe);
ratingRoutes.post('/driver/tips-paypal', userAuth({isAuth: true}), tipsThroughPaypal);
ratingRoutes.post('/driver/tips-mollie', userAuth({isAuth: true}), tipsThroughMollie);
ratingRoutes.post('/driver/tips-mollie-webhook', userAuth({isAuth: true}), tipsThroughMollieCheck);

export default ratingRoutes;