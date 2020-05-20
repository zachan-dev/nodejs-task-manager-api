//using SendGrid
const sgMail = require('@sendgrid/mail');

const sendgridAPIKey = process.env.SENDGRID_API_KEY;
const registered_sender = process.env.SENDGRID_SENDER;

sgMail.setApiKey(sendgridAPIKey);

// sgMail.send({
//     from: process.env.SENDGRID_SENDER,
//     to: 'noreply@example.com',
//     subject: 'SendGrid testing email',
//     text: 'Testing SendGrid API from Twiio.' //can be html styled
// });

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        from: registered_sender,
        to: email,
        subject: 'Thanks for joining in the Task Manager App!',
        text: `Welcome to the Task Manager app, ${name}. Let me know how you get along with the app.`
    });
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        from: registered_sender,
        to: email,
        subject: 'Sorry to see you go! Thanks for using the Task Manager App.',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};