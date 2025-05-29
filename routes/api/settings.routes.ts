import {Router} from 'express';
import {
    getLanguages, getLanguageTranslations, getPaymentsSettings,
    getSettings,
    getSiteSettings,
    postLanguage, postLanguageTranslations,
    updateSettings,
    getPaymentsGateways, getAllLanguages,
    delLanguage
} from '../../controllers/settings.controller'
import {isDemoRequest, userAuth,} from '../../auth';

const settingsRoutes = Router();

settingsRoutes.get('/', userAuth({isAuth: true}), getSettings)
settingsRoutes.post('/', userAuth({isAdmin: true}), isDemoRequest, updateSettings)
settingsRoutes.get('/site', getSiteSettings)
settingsRoutes.get('/payment', getPaymentsSettings)
settingsRoutes.get('/payment-gateways', getPaymentsGateways)

settingsRoutes.get('/languages', getLanguages)
settingsRoutes.get('/all-languages', getAllLanguages)
settingsRoutes.post('/language', postLanguage)
settingsRoutes.delete('/language', userAuth({isAdmin: true}), isDemoRequest, delLanguage)

settingsRoutes.post('/cancellation-reason', userAuth({isAdmin: true}), postLanguage)

settingsRoutes.get('/language/translations', getLanguageTranslations)
settingsRoutes.post('/language/translations', userAuth({isAdmin: true}), postLanguageTranslations)


export default settingsRoutes;



