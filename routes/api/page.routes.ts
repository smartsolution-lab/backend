import {Router} from "express";
import {
    delPage,
    getAppPage,
    getAppPageContactUse,
    getCustomPage,
    getPage,
    postPage
} from "../../controllers/page.controller";
import {isDemoRequest, userAuth} from "../../auth";

const pageRoutes = Router()

pageRoutes.get('/', getPage)
pageRoutes.get('/about-us', getAppPage)
pageRoutes.get('/contact-page', getAppPageContactUse)
pageRoutes.get('/terms-conditions', getAppPage)
pageRoutes.get('/privacy-policy', getAppPage)
pageRoutes.get('/help-and-support', getAppPage)
pageRoutes.post('/', postPage)
pageRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delPage)

pageRoutes.get('/custom-page', getCustomPage)

export default pageRoutes