const moment = require('moment');

const constants = require('../email/constants');

class TownHall{
  constructor(opts){
    for (let keys in opts) {
      this[keys] = opts[keys];
    }
  }

  inNextWeek(lastEmailed){
    let townhall = this;
    let lastweekly = moment().day(constants.BIG_DAY - 7).endOf('day');
    let thisThursday = moment(lastweekly).add(7, 'days');
    let nextThursday = moment(lastweekly).add(14, 'days');
    let lastDaily = lastEmailed.daily;
    let today = new Date().getDay();
    let townhallDay = moment(townhall.dateObj);
    let include = townhall.include();

    if (townhall.dateObj) {
      if (townhall.dateObj < moment()) {
        // in past
        if (include) {
          TownHall.prints.inPast.push(`<li>${townhall.Date}</li>`);
        }
        return false;
      }
      if (today !== constants.BIG_DAY) {
        // not in the next week
        if (townhallDay.isAfter(thisThursday)) {
          if (include) {
            TownHall.prints.notInNextWeek.push(`<li>${townhall.Date}</li>`);
          }
          return false;
        }
        if (townhall.lastUpdated > lastDaily) {
          // if not Thursday, is the event new since last emailed?
          TownHall.prints.changedToday.push(`<li>${townhall.Date}, ${townhall.meetingType}, include? ${include}</li>`);
          return true;
        }
      }
      // if Thursday
      if ((today === constants.BIG_DAY) && (townhallDay.isBetween(moment().add(5, 'hours'), nextThursday, '(]'))) {
        if (include) {
          TownHall.prints.isThursday.push(`<li>${townhall.Date}}</li>`);
        }
        return true;
      } else
        return false;
    }
  }

  include(){
    let townhall = this;
    let include;
    switch (townhall.meetingType) {
    case 'Town Hall':
      include = true;
      break;
    case 'Empty Chair Town Hall':
      include = true;
      break;
    case 'Tele-Town Hall':
      include = true;
      break;
    case 'Adopt-A-District/State':
      include = true;
      break;
    case 'Other':
      if (townhall.iconFlag === 'in-person') {
        include = true;
      } else {
        include = false;
      }
      break;
    default:
      include = false;
    }
    return include;
  }

  emailText (){
    let date;
    let location;
    let time;
    let notes;
    let address;
    let updated;
    let title;
    if (this.repeatingEvent) {
      date = this.repeatingEvent;
    }  else if (this.dateString) {
      date = this.dateString;
    } else {
      date = this.Date;
    }
    if (this.meetingType === 'Tele-Town Hall') {
      location = this.phoneNumber;
      time = this.Time;
    } else if (this.timeZone) {
      location = this.Location;
      time = `${this.Time}, ${this.timeZone}`;
    } else {
      location = this.Location;
      time = this.Time;
    }
    if (time) {
      time = `<li>${time}</li>`;
    } else {
      time = '';
    }
    if (location) {
      location = `<li>${location}</li>`;
    } else {
      location = '';
    }
    if (this.eventName) {
      title = `<li>${this.eventName}</li>`;
    } else {
      title = '';
    }

    if (this.Notes) {
      notes = `<i>${this.Notes}</i></br>`;
    } else {
      notes = '';
    }
    if (this.address) {
      address = `<li>${this.address}</li>`;
    } else {
      address = '';
    }
    if (this.updatedBy) {
      updated = '*The details of this event were changed recently';
    } else {
      updated = '';
    }
    let eventTemplate =
      `<strong style="color:#0d4668">${this.Member} (${this.District}), <span style="color:#ff4741">${this.meetingType}</span></strong>
      <small><em>${updated}</em></small>
        <section style="margin-left:10px; margin-bottom: 20px; line-height: 20px">
        <ul>
          ${title}
          <li>${date}</li>
          ${time}
          ${location}
          ${address}
          <li><a href="https://townhallproject.com/?eventId=${this.eventId}">Link on townhallproject site</a></br>
          <p>${notes}</p>
        </ul>
        </section>`;
    return eventTemplate;
  }

  addToEventList(eventList, key){
    let townhall = this;
    if (!eventList[key]) {
      eventList[key] = [];
    }
    eventList[key].push(townhall);
  }
}

// Global data state
TownHall.townHallbyDistrict = {};
TownHall.senateEvents = {};

// admin.database.enableLogging(true);
TownHall.prints = {
  inPast: [],
  notInNextWeek: [],
  isThursday: [],
  changedToday : [],
};

module.exports = TownHall;
