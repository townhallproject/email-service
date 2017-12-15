const sendEmail = require('../lib/sendEmail');
const constants = require('../email/constants');

class Researcher {
  constructor(opts) {
    for (let keys in opts) {
      this[keys] = opts[keys];
    }
  }

  composeEmail(html) {
    let researcher = this;
    let data = {
      from: 'Town Hall Updates <update@updates.townhallproject.com>',
      to: constants.emailTo(researcher.username, researcher.email),
      bcc: process.env.ME,
      subject: 'Reminder to submit events',
      html: html,
    };
    data['h:Reply-To']=`TownHall Project <info@townhallproject.com>, ${process.env.EMILY}`;
    sendEmail.send(data);
  }
}

module.exports = Researcher;
