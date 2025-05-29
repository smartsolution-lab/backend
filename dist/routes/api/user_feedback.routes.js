"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const user_feedback_controller_1 = require("../../controllers/user_feedback.controller");
const userFeedbackRoutes = (0, express_1.Router)();
userFeedbackRoutes.post('/', (0, auth_1.userAuth)({ isUser: true }), user_feedback_controller_1.postUserFeedback);
userFeedbackRoutes.post('/update', (0, auth_1.userAuth)({ isAdmin: true }), user_feedback_controller_1.updateUserFeedback);
userFeedbackRoutes.get('/list', (0, auth_1.userAuth)({ isAdmin: true }), user_feedback_controller_1.getUserFeedbacks);
userFeedbackRoutes.get('/site', user_feedback_controller_1.getFeedbacksForSite);
userFeedbackRoutes.get('/', (0, auth_1.userAuth)({ isAuth: true }), user_feedback_controller_1.getUserFeedback);
userFeedbackRoutes.delete('/', (0, auth_1.userAuth)({ isAdmin: true }), auth_1.isDemoRequest, user_feedback_controller_1.delUserFeedback);
exports.default = userFeedbackRoutes;
//# sourceMappingURL=user_feedback.routes.js.map