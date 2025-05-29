import {Router} from 'express';

import {userAuth} from '../../auth';
import {
    getAdminDashBoardEarningGraphData, getAdminDonutChartCompleteCancel,
    getDriverDashBoardGraphData,
    getUserExpensesGraphData,
} from "../../controllers/dashboard.controller";
import {
    getDriverReport,
    getUserReport,
    getCompanyReport
} from "../../controllers/report.controller";

const reportRoutes = Router();
reportRoutes.get('/driver-earning', userAuth({isDriver: true}), getDriverDashBoardGraphData)
reportRoutes.get('/company-earning', userAuth({isAuth: true}), getAdminDashBoardEarningGraphData)
reportRoutes.get('/complete-cancel-donut', userAuth({isAuth: true}), getAdminDonutChartCompleteCancel)
reportRoutes.get('/user-expenses', userAuth({isUser: true}), getUserExpensesGraphData)
reportRoutes.get('/',)

// get
reportRoutes.get('/users', getUserReport);
reportRoutes.get('/drivers', getDriverReport);
reportRoutes.get('/company', getCompanyReport);

export default reportRoutes;