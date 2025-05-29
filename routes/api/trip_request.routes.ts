import {Router} from 'express';
import {isDemoRequest, userAuth} from '../../auth';
import {
    tripRequest,
    getTripRequestList,
    getDriverTripRequest,
    delTripRequest,
    getTripRequestByTripRequestId,
    tripRequestUpdateByUser, tripRequestUpdateByDriver,
    tripDataFetchByUserSocketResponse,
    tripDataFetchByDriverSocketResponse, getOngoingTrip, tripRequestCancel,
} from '../../controllers/trip_request.controller';


const tripRequestRoutes = Router();
tripRequestRoutes.post('/', userAuth({isAuth: true}), tripRequest);
tripRequestRoutes.post('/update-by-user', userAuth({isAuth: true}), tripRequestUpdateByUser);
tripRequestRoutes.post('/update-by-driver', userAuth({isAuth: true}), tripRequestUpdateByDriver);

tripRequestRoutes.post('/cancel', userAuth({isAuth: true}), tripRequestCancel);

tripRequestRoutes.get('/list', userAuth({isAuth: true}), getTripRequestList);
tripRequestRoutes.get('/ongoing', userAuth({isAuth: true}), getOngoingTrip);
tripRequestRoutes.get('/list-user', userAuth({isUser: true}), getTripRequestList);
tripRequestRoutes.get('/list-driver', userAuth({isDriver: true}), getTripRequestList);
tripRequestRoutes.get('/', userAuth({isAuth: true}), getTripRequestByTripRequestId);

tripRequestRoutes.get('/user-socket-response', tripDataFetchByUserSocketResponse);
tripRequestRoutes.get('/driver-socket-response', tripDataFetchByDriverSocketResponse);

tripRequestRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delTripRequest);

export default tripRequestRoutes;