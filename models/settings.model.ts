import {model, Schema} from 'mongoose'

let schema = new Schema({
    site_name: String,
    site_email: String,
    site_phone: String,
    site_footer: String,
    currency_name: String,
    currency_code: String,
    address: String,
    description: String,
    logo: String,
    max_distance: Number,
    app_link: {
        android: String,
        ios: String,
    },
    sms: {
        twilio_auth_token: String,
        twilio_sender_number: String,
        twilio_account_sid: String,
        active: {
            type: Boolean,
            default: false
        },
    },
    ssl_commercez: {
        name: String,
        image: String,
        credentials: {
            sslcommerz_url: String,
            sslcommerz_store_id: String,
            sslcommerz_store_password: String,
            sslcommerz_seccess_url: String,
            sslcommerz_fail_url: String,
            sslcommerz_cancel_url: String,
            sslcommerz_ipn_url: String,

            active: {
                type: Boolean,
                default: false
            },
        }
    },
    stripe: {
        name: String,
        image: String,
        credentials: {
            stripe_publishable_key: String,
            stripe_secret_key: String,
            active: {
                type: Boolean,
                default: false
            },
        }
    },
    paypal: {
        name: String,
        image: String,
        credentials: {
            paypal_base_url: String,
            paypal_client_id: String,
            paypal_secret_key: String,
            active: {
                type: Boolean,
                default: false
            },
        }
    },
    razor_pay: {
        name: String,
        image: String,
        credentials: {
            client_id: String,
            secret_key: String,
            active: {
                type: Boolean,
                default: false
            },
        }
    },
    mollie: {
        name: String,
        image: String,
        credentials: {
            mollie_live_api_key: String,
            active: {
                type: Boolean,
                default: false
            },
        }
    },
    flutterwave: {
        name: String,
        image: String,
        credentials: {
            public_key: String,
            secret_key: String,
            active: {
                type: Boolean,
                default: false
            },
        }
    },
    email: {
        default: String,
        sendgrid: {
            host: String,
            port: String,
            username: String,
            password: String,
            sender_email: String,
        },

        gmail: {
            auth_email: String,
            password: String,
            service_provider: String,
        },
        other: {
            host: String,
            port: String,
            address: String,
            password: String,
            provider_name: String,
        },
    },
    language: [
        {
            name: String
        },
    ],
    social_media_link: [
        {
            icon: String,
            name: String,
            link: String,
        }
    ],
    url: {
        website: String,
        login: String,
        signup: String,
        socket_url: String,
        backend: String,
    },
    push_notification_json: {
        file_name: String,
        json_value: String,
    },
    whatsapp: {
        token: String,
        endpoint: String,
        otp_template: String,
        password_template: String,
    },
    recaptcha: {
        login_recaptcha: {
            type: Boolean,
            default: false
        },
        register_recaptcha: {
            type: Boolean,
            default: false
        },
        site_key: String
    },
    site_key: String,
    googleMapsApiKey: String,
    cancellation_reason: [String],
    auto_cancel_reason: String

}, {timestamps: true})

const Settings = model('setting', schema)
export default Settings
