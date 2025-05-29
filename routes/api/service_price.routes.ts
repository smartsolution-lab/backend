import { Router } from 'express';
import {isDemoRequest, userAuth} from '../../auth';

import {
    createServicePrice, getServicePriceById, getOneServicePrice, deleteServicePrice, getServicePrices
} from '../../controllers/service_price.controller';


const servicePriceRoutes = Router();
servicePriceRoutes.post('/create', userAuth({isAdmin: true}), isDemoRequest, createServicePrice);
servicePriceRoutes.get('/', getServicePriceById);
servicePriceRoutes.get('/list', getServicePrices);
servicePriceRoutes.get('/get-one', getOneServicePrice);
servicePriceRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, deleteServicePrice);


export default servicePriceRoutes;