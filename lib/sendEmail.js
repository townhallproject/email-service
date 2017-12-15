const mailgun_api_key = process.env.MAILGUN_API_KEY;
const domain = 'updates.townhallproject.com';
const mailgun = require('mailgun-js')({apiKey: mailgun_api_key, domain: domain});

const sendEmail = {};

sendEmail.user = function(user, data){
  mailgun.messages().send(data, function () {
    console.log('sent');
  });
};


sendEmail.send = function(data){
  mailgun.messages().send(data, function () {
    console.log('sent');
  });
};

module.exports = sendEmail;
