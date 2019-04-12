#!/usr/bin/env node
require('dotenv').load();
const find = require('lodash').find;
const indexOf = require('lodash').indexOf;
const map = require('lodash').map;

const firebasedb = require('../lib/setupFirebase');
const TownHall = require('../townhall/townhall-model.js');
const getTownHalls = require('../townhall/getTownHalls');
const constants = require('../email/constants');
const Press = require('../press/model');
const sendEmail = require('../lib/send-email');

// unpacks data from action network
function PartnerEmail(opts) {
  for (let key in opts){
    this[key] = opts[key];
  }
}

// composes email using the list of events
PartnerEmail.prototype.composeEmail = function(district, events){
  const username = '';
  let isTHFOL = find(events, {iconFlag: 'mfol'});
  let htmltext = isTHFOL ? constants.introTHFOL(username) : constants.intro(username);
  // let htmltext = constants.intro(username);
  events.forEach(function(townhall){
    if (!townhall.emailText()) {
      console.log(townhall);
    } else {
      let townhallHtml = townhall.emailText();
      htmltext = htmltext + townhallHtml;
    }
  });
  htmltext = isTHFOL ? htmltext + constants.LEGEND + constants.QUICK_NOTES_THFOL : htmltext + constants.LEGEND + constants.QUICK_NOTES;
  const today = new Date().getDay();
  let data = {
    from: 'Town Hall Updates <update@updates.townhallproject.com>',
    to: process.env.ME,
    cc: constants.partnerEmailCC(),
    subject: constants.subjectLinePartner(today, district),
    html: htmltext,
  };
  sendEmail.send(data);
};

PartnerEmail.eventReport = function(){
  let html = '';
  for (const key of Object.keys(TownHall.prints)) {
    html = html + `<ul>${key}</ul>`;
    TownHall.prints[key].forEach(function(ele){
      html = html + ele;
    });
  }
  let data = {
    from: 'Town Hall Updates <update@updates.townhallproject.com>',
    to: process.env.ME,
    subject: 'Events checked',
    html: html,
  };
  sendEmail.send(data);
};

getTownHalls().then(function(){
  console.log('got events');
  PartnerEmail.eventReport();
  for (const key of Object.keys(TownHall.townHallbyDistrict)) {
    let thispartnerEmail = new PartnerEmail();
    thispartnerEmail.composeEmail(key, TownHall.townHallbyDistrict[key]);
  }
  for (const key of Object.keys(TownHall.senateEvents)) {
    let newuser = new PartnerEmail();
    newuser.composeEmail(key, TownHall.senateEvents[key]);
  }
});


firebasedb.ref('subscribers/').once('value').then(subscribers => {
  getTownHalls(true).then(function () {
    console.log('got events');
    subscribers.forEach(subscriberRef => {
      const subscriber = subscriberRef.val();
      let townHallsToSend = {};
      for (const key of Object.keys(TownHall.townHallbyDistrict)) {
        if (indexOf(subscriber.districts, key) >= 0) {
          townHallsToSend[key] = TownHall.townHallbyDistrict[key];
        }
      }
      for (const key of Object.keys(TownHall.senateEvents)) {
        if (indexOf(subscriber.districts, key) >= 0) {
          townHallsToSend[key] = TownHall.townHallbyDistrict[key];
        }
      }
      for (const key of Object.keys(TownHall.stateEvents)) {
        if (indexOf(subscriber.districts, key) >= 0 ) {
          townHallsToSend[key] = TownHall.stateEvents[key];
        } else if (indexOf(subscriber.districts, `${key.split('-')[0]}-state-events`) >= 0 ) {
          townHallsToSend[key] = TownHall.stateEvents[key];
        }
      }
      const sendTo = process.env.NODE_ENV === 'production' ? subscriber.email : process.env.GMAIL;
      if (townHallsToSend) {
        console.log('sending subscribers emails', map(townHallsToSend, (ele, key) => key), subscriber.email);
        Press.composeEmail(townHallsToSend, subscriber.name, sendTo);
      }
    });
  });
});

module.exports = PartnerEmail;
