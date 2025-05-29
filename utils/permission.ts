const crud = [
    {
        name: 'Create',
        permission: 'create'
    },
    {
        name: 'Edit',
        permission: 'edit'
    },
    {
        name: 'Delete',
        permission: 'delete'
    },
    {
        name: 'Show',
        permission: 'show'
    }
]

const modules = [
    {
        name: 'Service Management',
        permission: 'service_management',
    },
    {
        name: 'Service Category',
        permission: 'service_category',
        child: crud
    },
    {
        name: 'Service Package',
        permission: 'service_package',
        child: crud
    },
    {
        name: 'Service',
        permission: 'service',
        child: crud
    },
    {
        name: 'Service Brands',
        permission: 'service_brands',
        child: crud
    },
    {
        name: 'Service Vehicles',
        permission: 'service_vehicle',
        child: crud
    },
    {
        name: 'Service Location',
        permission: 'service_location',
        child: crud
    },
    {
        name: 'Service Fare Management',
        permission: 'service_fare_management',
        child: crud
    },


    {
        name: 'User Management',
        permission: 'user_management',
    },
    {
        name: 'User List',
        permission: 'user_list',
        child: crud
    },
    {
        name: 'User Wallet Deposits',
        permission: 'user_wallet_deposit',
        child: crud
    },
    {
        name: 'User Payment Records',
        permission: 'user_payment_record',
        child: crud
    },
    {
        name: 'User Ratings',
        permission: 'user_ratting',
        child: crud
    },


    {
        name: 'Driver Management',
        permission: 'driver_management',
    },
    {
        name: 'Driver List',
        permission: 'driver_list',
        child: crud
    },
    {
        name: 'Driver Vehicle List',
        permission: 'driver_vehicle_list',
        child: crud
    },
    {
        name: 'Driver Earnings',
        permission: 'driver_earnings',
        child: crud
    },
    {
        name: 'Driver Document Input',
        permission: 'driver_document_input',
        child: crud
    },


    {
        name: 'Coupon',
        permission: 'coupon',
    },
    {
        name: 'Coupon List',
        permission: 'coupon_list',
        child: crud
    },
    {
        name: 'Coupon Create',
        permission: 'coupon_create',
        child: crud
    },


    {
        name: 'Trip Management',
        permission: 'trip_management',
    },
    {
        name: 'Trips',
        permission: 'trips',
        child: crud
    },
    {
        name: 'Trips Cancelled',
        permission: 'trips_cancelled',
        child: crud
    },


    {
        name: 'Withdraw',
        permission: 'withdraw',
    },
    {
        name: 'Withdraw Requests',
        permission: 'withdraw_request',
        child: crud
    },


    {
        name: 'Frontend Pages',
        permission: 'frontend_pages',
    },
    {
        name: 'Frontend Landing Page',
        permission: 'frontend_landing_page',
        child: crud
    },
    {
        name: 'Frontend Login Page',
        permission: 'frontend_login_page',
        child: crud
    },
    {
        name: 'Frontend Contact Page',
        permission: 'frontend_contact_page',
        child: crud
    },
    {
        name: 'Frontend FAQ',
        permission: 'frontend_faq',
        child: crud
    },
    {
        name: 'Frontend About Us',
        permission: 'frontend_about_us',
        child: crud
    },
    {
        name: 'Frontend Terms & Conditions',
        permission: 'frontend_terms_and_conditions',
        child: crud
    },
    {
        name: 'Frontend Privacy Policy ',
        permission: 'frontend_privacy_policy',
        child: crud
    },
    {
        name: 'Frontend Services',
        permission: 'frontend_services',
        child: crud
    },
    {
        name: 'Frontend Business',
        permission: 'frontend_business',
        child: crud
    },
    {
        name: 'Frontend Safety',
        permission: 'frontend_safety',
        child: crud
    },
    {
        name: 'Frontend Blog',
        permission: 'frontend_blog',
        child: crud
    },
    {
        name: 'Frontend Press',
        permission: 'frontend_press',
        child: crud
    },
    {
        name: 'Frontend Custom Page',
        permission: 'frontend_custom_page',
        child: crud
    },


    {
        name: 'HRM',
        permission: 'hrm',
    },
    {
        name: 'HRM All Employee',
        permission: 'hrm_all_employee',
        child: crud
    },
    {
        name: 'HRM Departments',
        permission: 'hrm_department',
        child: crud
    },
    {
        name: 'HRM Roles & Permissions',
        permission: 'hrm_role_permission',
        child: crud
    },
    {
        name: 'HRM Attendance',
        permission: 'hrm_attendance',
        child: crud
    },
    {
        name: 'HRM Attendance Settings',
        permission: 'hrm_attendance_settings',
        child: crud
    },
    {
        name: 'HRM Time Sheet',
        permission: 'hrm_time_sheet',
        child: crud
    },
    {
        name: 'HRM Holidays',
        permission: 'hrm_holidays',
        child: crud
    },
    {
        name: 'HRM Leaves',
        permission: 'hrm_leaves',
        child: crud
    },
    {
        name: 'HRM Leaves Setting',
        permission: 'hrm_leaves_setting',
        child: crud
    },


    {
        name: 'Payroll',
        permission: 'payroll',
    },
    {
        name: 'Payroll Salary Sheet',
        permission: 'payroll_salary_sheet',
        child: crud
    },
    {
        name: 'Payroll Employee Salary',
        permission: 'payroll_employee_salary',
        child: crud
    },
    {
        name: 'Payroll Advance Salary',
        permission: 'payroll_advance_salary',
        child: crud
    },
    {
        name: 'Payroll Salary Settings',
        permission: 'payroll_salary_settings',
        child: crud
    },


    {
        name: 'Employee Ticket',
        permission: 'employee_ticket',
    },
    {
        name: 'Support Ticket',
        permission: 'support_ticket',
    },
    {
        name: 'Marketing',
        permission: 'marketing',
    },
    {
        name: 'Push Notification',
        permission: 'push_notification',
    },
    {
        name: 'Feedback',
        permission: 'feedback',
        child: crud
    },
    {
        name: 'Report',
        permission: 'report',
    },
    {
        name: 'Settings',
        permission: 'setting',
        child: crud
    },
]


let permissions = modules?.map(m => {
    if (m.child) {
        return {
            ...m,
            child: m.child?.map(c => ({
                ...c,
                permission: `${m.permission}_${c.permission}`
            }))
        }
    }
    return m
})
export default permissions