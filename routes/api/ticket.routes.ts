import {Router} from 'express';
import {userAuth} from '../../auth';

import {
    deleteTicketPriority,
    delTicketSetting, getTicket,
    getTicketDepartment, getTicketPriority,
    getTicketType, postTicket, postTicketPriority,
    postTicketSetting,
    postTicketDepartment,
    ticketDepartmentList,
    postTicketType, fetchTicketTypeList, fetchTicketEmployeeList, postTicketMessage, getTicketByUser, postTicketNotes
} from '../../controllers/ticket.controller';

const ticketRoutes = Router();
ticketRoutes.get('/', getTicket);
ticketRoutes.get('/by-user', userAuth({isAuth: true}), getTicketByUser);
ticketRoutes.post('/', userAuth({isAuth: true}), postTicket);
ticketRoutes.post('/message', postTicketMessage);
ticketRoutes.post('/note', postTicketNotes);

ticketRoutes.get('/priorities', getTicketPriority);
ticketRoutes.post('/priorities', postTicketPriority);
ticketRoutes.delete('/priorities', deleteTicketPriority);

ticketRoutes.get('/department', getTicketDepartment);
ticketRoutes.get('/type', getTicketType);

ticketRoutes.post('/settings', postTicketSetting);
ticketRoutes.delete('/settings', delTicketSetting);

// by Sabbir, from here
ticketRoutes.post('/department', userAuth({isAdmin: true}), postTicketDepartment);
ticketRoutes.get('/department-list', ticketDepartmentList);
ticketRoutes.post('/type', userAuth({isAdmin: true}), postTicketType);
ticketRoutes.get('/type-list', fetchTicketTypeList);
ticketRoutes.get('/employee-list', fetchTicketEmployeeList);


export default ticketRoutes;
