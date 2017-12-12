const sendEmail = require('../sendEmail');
const composeEmails = {};

composeEmails.composeErrorEmail = function(user, error) {
  const data = {
    from: 'Town Hall Updates <update@updates.townhallproject.com>',
    to: process.env.ME,
    subject: `Error sending emails`,
    html: `${user} ${error}`,
  };
  sendEmail.user(user, data);
};

module.exports = composeEmails;
