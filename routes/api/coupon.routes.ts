import {Router} from 'express';

const couponRoutes = Router();

import {
    createCoupon,
    couponApply,
    getCoupon,
    delCoupon, getCouponOffer
} from '../../controllers/coupon.controller';
import {isDemoRequest, userAuth} from '../../auth';


couponRoutes.post('/', userAuth({isAdmin: true}), isDemoRequest, createCoupon);
couponRoutes.post('/apply', userAuth({isAuth: true}), couponApply);
couponRoutes.get('/', userAuth({isAuth: true}), getCoupon);
couponRoutes.get('/offer', userAuth({isAuth: true}), getCouponOffer);
couponRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delCoupon);


export default couponRoutes;