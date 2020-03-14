const moment = require('moment');

const constants = require('../email/constants');
const firebasedb = require('../lib/setupFirebase');

class TownHall{
  constructor(opts, level){
    for (let keys in opts) {
      this[keys] = opts[keys];
    }
    if (level) {
      this.level = level;
    }
  }

  inNextWeek(){
    let dateToday = moment();
    let townhall = this;
    let bigDayDate = moment(dateToday);
    let thisBigDay = bigDayDate.day(constants.BIG_DAY).endOf('day');
    let lastweekly;
    let nextWeeklyEmail;
    let today = dateToday.day();
    let townhallDay = moment(townhall.dateObj);

    if (thisBigDay.isBefore(dateToday)){
      lastweekly = thisBigDay;
    } else {
      lastweekly = bigDayDate.day(constants.BIG_DAY - 7 ).endOf('day');
    }
    if (today === constants.BIG_DAY) {
      nextWeeklyEmail = moment(lastweekly).add(14, 'days');
    } else {
      nextWeeklyEmail = moment(lastweekly).add(7, 'days');
    }
    let include = townhall.include();
    if (townhall.dateObj) {
      if (townhallDay.isBefore(dateToday)) {
        // in past
        if (include) {
          TownHall.prints.inPast.push(`<li>${townhall.dateString}</li>`);
        }
        return false;
      }
      if (today !== constants.BIG_DAY) {
        // not in the next week
        if (townhallDay.isAfter(nextWeeklyEmail)) {
          if (include) {
            TownHall.prints.notInNextWeek.push(`<li>${townhall.dateString}</li>`);
          }
          return false;
        }
        if (moment(townhall.lastUpdated).isBetween(lastweekly, nextWeeklyEmail, '[)') && moment().diff(moment(townhall.lastUpdated), 'h') < 24) {
          // if not Thursday, is the event new since last emailed?
          TownHall.prints.changedToday.push(`<li>${townhall.dateString}, ${townhall.meetingType}, include? ${include}</li>`);
          return true;
        }
      }
      // if Wednesday
      if ((today === constants.BIG_DAY) && (townhallDay.isBetween(dateToday.add(5, 'hours'), nextWeeklyEmail, '(]'))) {
        console.log('in next week');
        if (include) {
          TownHall.prints.isThursday.push(`<li>${townhall.dateString}}</li>`);
        }
        return true;
      } else
        return false;
    }
  }

  include(){
    let townhall = this;
    let include;
    if (townhall.state === 'PA') {
      return false;
    }
    switch (townhall.meetingType) {
    case 'Tele-Town Hall': // changed from Town Hall because of covid-19
      include = true;
      break;
    case 'Empty Chair Town Hall':
      include = true;
      break;
    case 'Campaign Town Hall':
      include = true;
      break;
    default:
      if (townhall.iconFlag === 'mfol'){
        include = true;
      } else {
        include = false;
      }
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
    let urlParams;
    let repinfo = '';
    if (this.repeatingEvent) {
      date = this.repeatingEvent;
    }  else if (this.dateString) {
      date = this.dateString;
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
    if (this.chamber === 'upper' && this.level === 'federal'){
      repinfo = '(Senate)';
    } else if (this.state && this.district) {
      repinfo = `(${this.state}-${this.district})`;
    }
    if (this.level === 'federal') {
      urlParams = `?eventId=${this.eventId}`;
    } else if (this.level === 'state' && this.stateName) {
      urlParams = `${this.stateName.toLowerCase()}?eventId=${this.eventId}&state=${this.state}`;
    } else  if (this.state) {
      urlParams = `?eventId=${this.eventId}&state=${this.state}`;
    }
    let eventTemplate =
    `<div style="box-shadow:0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); padding:20px; margin-bottom:10px;">
    <strong style="color:#0d4668">${this.displayName} ${repinfo}, <span style="color:#ff4741">${this.meetingType}</span></strong>
    <small><em>${updated}</em></small>
    <section style="margin-left:10px; margin-bottom: 20px; line-height: 20px">
    <ul>
    ${title}
          <li>${date}</li>
          ${time}
          ${location}
          ${address}
          <li><a href="https://townhallproject.com/${urlParams}">Link on townhallproject site</a></br>
          <p>${notes}</p>
        </ul>
        </section>
        </div>`;
    return eventTemplate;
  }

  incrementSentNumber() {
    const countRef = firebasedb.ref(`townHallIds/${this.eventId}/number_emails_sent`);
    return countRef.transaction(function (current_value) {
      return (current_value || 0) + 1;
    });
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
TownHall.stateEvents = {};

// admin.database.enableLogging(true);
TownHall.prints = {
  inPast: [],
  notInNextWeek: [],
  isThursday: [],
  changedToday : [],
};

module.exports = TownHall;
