const sendEmail = require('../lib/sendEmail');

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
      to: `${researcher.username} <${researcher.email}>`,
      bcc: 'meganrm@gmail.com',
      subject: 'Reminder to submit events',
      html: html,
    };
    data['h:Reply-To']='TownHall Project <info@townhallproject.com>, Emily Blumberg <emilysblumberg@gmail.com>';
    sendEmail.send(data);
  }
}

module.exports = Researcher;
