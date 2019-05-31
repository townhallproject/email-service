require('dotenv').load();

const sendEmail = require('../lib/send-email');
const constants = require('../email/constants');

class Press {
  constructor(opts) {
    this.email = opts.email;
    this.name = opts.name || null;
    this.districts = opts.districts;
  }

  static unpackEvents(key, townhalls) {
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

  static composeEmail(eventsToSend, name, emailTo) {
    let htmltext = '';
    for (const key of Object.keys(eventsToSend)) {
      htmltext += Press.unpackEvents(key, eventsToSend[key]);
    }

    let data = {
      from: 'Town Hall Updates <update@updates.townhallproject.com>',
      to: constants.emailTo(name, emailTo),
      html: htmltext,
      subject: 'Town halls in the next week',
    };
    sendEmail.send(data);
  }

  getEventsToSend(TownHall) {
    const townHallsToSend = {};
    for (const key of Object.keys(TownHall.townHallbyDistrict)) {
      if (this.districts.indexOf(key) >= 0 ) {
        townHallsToSend[key] = TownHall.townHallbyDistrict[key];
      }
    }
    for (const key of Object.keys(TownHall.senateEvents)) {
      if (this.districts.indexOf(key) >= 0) {
        townHallsToSend[key] = TownHall.senateEvents[key];
      }
    }
    for (const key of Object.keys(TownHall.stateEvents)) {
      if (this.districts.indexOf(key) >= 0) {
        townHallsToSend[key] = TownHall.stateEvents[key];
      } else if (this.districts.indexOf(`${key.split('-')[0]}-state-events`) >= 0) {
        townHallsToSend[key] = TownHall.stateEvents[key];
      }
    }
    return townHallsToSend;
  }
}

module.exports = Press;
