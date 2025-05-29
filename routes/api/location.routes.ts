import {Router} from 'express';

import {isDemoRequest, userAuth} from '../../auth';
import {
    postLocation, getLocationList, userAreaCheckInsideOfMap, delLocation
} from '../../controllers/locations.controller';


const locationRoutes = Router();
locationRoutes.post('/', postLocation);
locationRoutes.get('/list', getLocationList);
locationRoutes.get('/check-user-inside-location', userAreaCheckInsideOfMap);
locationRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delLocation);


export default locationRoutes;