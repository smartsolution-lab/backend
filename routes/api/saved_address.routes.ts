import { Router } from 'express';
import { userAuth } from '../../auth';
import {delSavedAddress, getSavedAddress, postSavedAddress} from "../../controllers/saved_address.controller";

const savedAddressRoutes = Router();
savedAddressRoutes.post('/', userAuth({isAuth: true}), postSavedAddress)
savedAddressRoutes.get('/list', userAuth({isAuth: true}), getSavedAddress)
savedAddressRoutes.get('/', userAuth({isAuth: true}), getSavedAddress)
savedAddressRoutes.delete('/', userAuth({isAuth: true}), delSavedAddress)

export default savedAddressRoutes;