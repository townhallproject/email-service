composeEmails = {};

composeEmails.composeErrorEmail = function(user, error) {
  var data = {
    from: 'Town Hall Updates <update@updates.townhallproject.com>',
    to: 'meganrm@townhallproject.com',
    subject: `Error sending emails`,
    html: `${user} ${error}`
  };
  User.sendEmail(user, data);
};

module.exports = composeEmails;
