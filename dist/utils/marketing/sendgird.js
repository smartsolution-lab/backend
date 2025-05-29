"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendGridEmail = void 0;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
    to: 'test@example.com',
    from: 'test@example.com',
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
const sendGridEmail = async (msg) => {
    sgMail
        .send(msg)
        .then(() => {
        console.log('Email sent');
    })
        .catch((error) => {
        console.error(error);
    });
};
exports.sendGridEmail = sendGridEmail;
//# sourceMappingURL=sendgird.js.map