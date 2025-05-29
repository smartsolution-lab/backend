import {Router} from "express";
import userRoutes from "./api/user.routes";
import roleRoutes from "./api/role.routes";
import settings from "./api/settings.routes";
import frontendRoutes from './api/frontend.routes';
import blogRoutes from './api/blog.routes';
import vehicleRoutes from "./api/vehicle.routes";
import serviceCategoryRoutes from './api/service.routes'
import fileRoutes from './api/files.routes'
import formFields from "./api/form_fields.routes";
import userFormFields from "./api/user_form_field.routes";
import applications from "./api/applications.routes";
import ratingRoutes from "./api/rating.routes";
import servicePriceRoutes from './api/service_price.routes'
import locationRoutes from './api/location.routes'
import pageRoutes from "./api/page.routes";
import bookingRoutes from "./api/booking.routes";
import tripRequestRoutes from "./api/trip_request.routes";
import paymentRoutes from "./api/payment.routes";
import ticket from "./api/ticket.routes";
import departmentRoutes from "./api/department.routes";
import leaveSettingsRoutes from './api/leave_setting.routes';
import leaveRoutes from './api/leave.routes';
import holidayRoutes from './api/holiday.routes';
import attendanceRoutes from './api/attendance.routes';
import timeSheetRoutes from './api/timeSheet.routes';
import operatingTimeRoutes from './api/operating_time.routes';
import knowledge_baseRoutes from "./api/knowledge_base.routes";
import marketingRoutes from "./api/marketing.routes";
import walletRoutes from "./api/wallet.routes";
import userFeedbackRoutes from "./api/user_feedback.routes";
import pushNotification from "./api/pushNotification";
import couponRoutes from "./api/coupon.routes";
import withdrawRoutes from "./api/withdraw.routes";
import payrollRoutes from "./api/payroll.routes";
import Notification from "./api/notification.routes";
import reportRoutes from "./api/report.routes";
import chattingRoutes from "./api/chatting.routes";
import savedAddressRoutes from "./api/saved_address.routes";


const apiRouters = Router();
apiRouters.use('/user', userRoutes);
apiRouters.use('/role', roleRoutes);
apiRouters.use('/settings', settings);
apiRouters.use('/ticket', ticket);
apiRouters.use('/knowledge-base', knowledge_baseRoutes);
apiRouters.use('/frontend', frontendRoutes);
apiRouters.use('/blog', blogRoutes);
apiRouters.use('/page', pageRoutes);
apiRouters.use('/vehicle', vehicleRoutes);
apiRouters.use('/service', serviceCategoryRoutes);
apiRouters.use('/file', fileRoutes);
apiRouters.use('/form-field', formFields);
apiRouters.use('/user-form-field', userFormFields);
apiRouters.use('/application', applications);
apiRouters.use('/rating', ratingRoutes);
apiRouters.use('/service-price', servicePriceRoutes);
apiRouters.use('/location', locationRoutes);
apiRouters.use('/booking', bookingRoutes);
apiRouters.use('/trip', tripRequestRoutes);
apiRouters.use('/payment', paymentRoutes);
apiRouters.use('/department', departmentRoutes);
apiRouters.use('/operating-time', operatingTimeRoutes);
apiRouters.use('/leave', leaveRoutes);
apiRouters.use('/leave-setting', leaveSettingsRoutes);
apiRouters.use('/holiday', holidayRoutes);
apiRouters.use('/attendance', attendanceRoutes);
apiRouters.use('/department', departmentRoutes);
apiRouters.use('/timeSheet', timeSheetRoutes);
apiRouters.use('/marketing', marketingRoutes);
apiRouters.use('/wallet', walletRoutes);
apiRouters.use('/user-feedback', userFeedbackRoutes);
apiRouters.use('/push-notification', pushNotification);
apiRouters.use('/notification', Notification);
apiRouters.use('/coupon', couponRoutes);
apiRouters.use('/withdraw', withdrawRoutes);
apiRouters.use('/payroll', payrollRoutes);
apiRouters.use('/report', reportRoutes);
apiRouters.use('/chatting', chattingRoutes);
apiRouters.use('/saved-address', savedAddressRoutes);


module.exports = apiRouters;

