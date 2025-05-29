import {Router} from 'express';
import {userAuth} from '../../auth';

import {
    getSettings,
    updateSettings,
    delMarketingGroups,
    getAvailableUsers,
    getMarketingGroups,
    postDeliveryEmail,
    postMarketingGroups,
    postUsers,
    getAllMail,
    getAllUsers,
    postAllUsers,
    getSubscribedUsers,
    postSubscribeUsers,
    postDeliverySMS,
    getAllSMS,
    delDeliveryEmail,
    delDeliverySMS,
    delWhatsappMessage,
    postWhatsappMessage, getAllWhatsappMessage
} from '../../controllers/marketing.controller';

const marketingRoutes = Router();

//group CRUD routes
marketingRoutes.get('/groups', getMarketingGroups);
marketingRoutes.post('/groups', postMarketingGroups);
marketingRoutes.delete('/groups', delMarketingGroups);

//Marketing Users Routes
marketingRoutes.get('/subscriber', getSubscribedUsers);
marketingRoutes.post('/subscriber', postSubscribeUsers);

marketingRoutes.get('/users', getAllUsers);
marketingRoutes.post('/users', postAllUsers);
marketingRoutes.get('/available-user', getAvailableUsers);
marketingRoutes.post('/available-user', postUsers);

//email configuration & send Route
marketingRoutes.get('/', getSettings)
marketingRoutes.post('/', updateSettings)

//email routes
marketingRoutes.get('/all-mail', getAllMail)
marketingRoutes.post('/deliver-email', postDeliveryEmail);
marketingRoutes.delete('/deliver-email', delDeliveryEmail);

//sms routes
marketingRoutes.get('/all-sms', getAllSMS)
marketingRoutes.post('/deliver-sms', postDeliverySMS);
marketingRoutes.delete('/deliver-sms', delDeliverySMS);

marketingRoutes.get('/all-whatsapp-message', getAllWhatsappMessage)
marketingRoutes.post('/deliver-whatsapp-message', postWhatsappMessage);
marketingRoutes.delete('/deliver-whatsapp-message', delWhatsappMessage);


export default marketingRoutes;