const mailgun_api_key = process.env.MAILGUN_API_KEY;
const SEND = process.env.SEND;
const domain = 'updates.townhallproject.com';
const mailgun = require('mailgun-js')({apiKey: mailgun_api_key, domain: domain});

const sendEmail = {};

sendEmail.user = function(user, data){
  if (SEND === 'dontSend') {
    return;
  }
  mailgun.messages().send(data, function () {
  });
};


sendEmail.send = function(data){
  if (SEND === 'dontSend') {
    return;
  }
  mailgun.messages().send(data, function () {
    console.log('sending'), data.to;
  });
};

module.exports = sendEmail;
