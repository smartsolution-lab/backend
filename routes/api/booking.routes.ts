import {Router} from 'express';
import {userAuth} from '../../auth';
import {
    postBooking,
    getBookingList,
    delBooking,
    getBooking,
    bookingRequestUpdateByDriver,
    bookingConfirmation,
} from '../../controllers/booking.controller';


const bookingRoutes = Router();
bookingRoutes.post('/', userAuth({isUser: true}), postBooking);
bookingRoutes.post('/update-status', userAuth({isDriver: true}), bookingRequestUpdateByDriver);
bookingRoutes.post('/confirmation', userAuth({isAdmin: true}), bookingConfirmation);
bookingRoutes.get('/list', userAuth({isAuth: true}), getBookingList);
bookingRoutes.get('/', getBooking);
bookingRoutes.delete('/', userAuth({isAdmin: true}), delBooking);

export default bookingRoutes;