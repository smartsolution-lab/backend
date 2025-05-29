import {Router} from 'express';
import {isDemoRequest, userAuth} from '../../auth';
import {
    postUserFeedback,
    updateUserFeedback,
    getUserFeedbacks,
    delUserFeedback,
    getUserFeedback, getFeedbacksForSite
} from '../../controllers/user_feedback.controller';

const userFeedbackRoutes = Router();
userFeedbackRoutes.post('/', userAuth({isUser: true}), postUserFeedback);
userFeedbackRoutes.post('/update', userAuth({isAdmin: true}), updateUserFeedback);
userFeedbackRoutes.get('/list', userAuth({isAdmin: true}), getUserFeedbacks);
userFeedbackRoutes.get('/site', getFeedbacksForSite);
userFeedbackRoutes.get('/', userAuth({isAuth: true}), getUserFeedback);
userFeedbackRoutes.delete('/', userAuth({isAdmin: true}), isDemoRequest, delUserFeedback);

export default userFeedbackRoutes;