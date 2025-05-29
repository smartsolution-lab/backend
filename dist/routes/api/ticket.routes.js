"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../auth");
const ticket_controller_1 = require("../../controllers/ticket.controller");
const ticketRoutes = (0, express_1.Router)();
ticketRoutes.get('/', ticket_controller_1.getTicket);
ticketRoutes.get('/by-user', (0, auth_1.userAuth)({ isAuth: true }), ticket_controller_1.getTicketByUser);
ticketRoutes.post('/', (0, auth_1.userAuth)({ isAuth: true }), ticket_controller_1.postTicket);
ticketRoutes.post('/message', ticket_controller_1.postTicketMessage);
ticketRoutes.post('/note', ticket_controller_1.postTicketNotes);
ticketRoutes.get('/priorities', ticket_controller_1.getTicketPriority);
ticketRoutes.post('/priorities', ticket_controller_1.postTicketPriority);
ticketRoutes.delete('/priorities', ticket_controller_1.deleteTicketPriority);
ticketRoutes.get('/department', ticket_controller_1.getTicketDepartment);
ticketRoutes.get('/type', ticket_controller_1.getTicketType);
ticketRoutes.post('/settings', ticket_controller_1.postTicketSetting);
ticketRoutes.delete('/settings', ticket_controller_1.delTicketSetting);
// by Sabbir, from here
ticketRoutes.post('/department', (0, auth_1.userAuth)({ isAdmin: true }), ticket_controller_1.postTicketDepartment);
ticketRoutes.get('/department-list', ticket_controller_1.ticketDepartmentList);
ticketRoutes.post('/type', (0, auth_1.userAuth)({ isAdmin: true }), ticket_controller_1.postTicketType);
ticketRoutes.get('/type-list', ticket_controller_1.fetchTicketTypeList);
ticketRoutes.get('/employee-list', ticket_controller_1.fetchTicketEmployeeList);
exports.default = ticketRoutes;
//# sourceMappingURL=ticket.routes.js.map