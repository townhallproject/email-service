require('dotenv').load();

const sendEmail = require('../lib/send-email');
const constants = require('../email/constants');

class Press {
  constructor(opts) {
    for (let keys in opts) {
      this[keys] = opts[keys];
    }
  }

  static upbackEvents(key, townhalls) {
    console.log(key, townhalls);
    if(!townhalls){
      return '';
    }
    let report = `<div>Events in ${key}: ${townhalls.length}</div>`;

    report += townhalls.map(function (townhall) {
      if (!townhall.emailText()) {
        console.log(townhall);
      } else {
        return townhall.emailText();
      }
    }).join('');
    return report;
  }

  static composeEmail(eventsToSend) {
    let htmltext = '';
    for (const key of Object.keys(eventsToSend)) {
      htmltext += Press.upbackEvents(key, eventsToSend[key]);
    }

    let data = {
      from: 'Town Hall Updates <update@updates.townhallproject.com>',
      to: constants.emailTo('Jason Lange', process.env.JASON),
      html: htmltext,
      subject: 'Town halls in the next week',
    };
    sendEmail.send(data);
  }
}

module.exports = Press;
