const sendEmail = require('../lib/sendEmail');
const composeEmails = {};

composeEmails.errorEmail = function(message, error) {
  const data = {
    from: 'Town Hall Updates <update@updates.townhallproject.com>',
    to: process.env.ME,
    subject: `Error sending emails`,
    html: `${message} ${error}`,
  };
  sendEmail.user(message, data);
};

module.exports = composeEmails;
