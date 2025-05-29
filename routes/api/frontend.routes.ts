import { Router } from 'express';
const frontendRoutes = Router();

import {isDemoRequest, userAuth} from '../../auth';
import {
    postLandingPage, delLandingPage, getLandingPage,
    getEarnWithShare, postEarnWithShare, postContuctUsInfo
} from '../../controllers/frontend.controller'

// LandingPage
frontendRoutes.post('/landing-page', userAuth({isAdmin: true}), isDemoRequest, postLandingPage)
frontendRoutes.get('/landing-page', getLandingPage)
frontendRoutes.delete('/landing-page', userAuth({isAdmin: true}), isDemoRequest, delLandingPage)
frontendRoutes.post('/landing-page/contactUsInfo', postContuctUsInfo)

// earn with share
frontendRoutes.post('/earn-with-share-page', userAuth({isAdmin: true}), isDemoRequest, postEarnWithShare)
frontendRoutes.get('/earn-with-share-page', getEarnWithShare)


export default frontendRoutes;