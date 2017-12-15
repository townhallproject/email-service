#!/usr/bin/env node
require('dotenv').load();

// settings for mailgun
const mailgun_api_key = process.env.MAILGUN_API_KEY;
const domain = 'updates.townhallproject.com';
const mailgun = require('mailgun-js')({apiKey: mailgun_api_key, domain: domain});

const TownHall = require('../townhall/model.js');
const getTownHalls = require('../townhall/getTownHalls');
const getLastSent = require('../townhall/getLastSent');
const constants = require('../email/constants');

// unpacks data from action network
function PartnerEmail(opts) {
  for (let key in opts){
    this[key] = opts[key];
  }
}
PartnerEmail.sendEmail = function(user, data){
  mailgun.messages().send(data, function () {
  });
};
// composes email using the list of events
PartnerEmail.prototype.composeEmail = function(district, events){
  const username = '';
  const partner = this;
  let htmltext = constants.intro(username);
  events.forEach(function(townhall){
    if (!townhall.emailText()) {
      console.log(townhall);
    } else {
      let townhallHtml = townhall.emailText();
      htmltext = htmltext + townhallHtml;
    }
  });
  htmltext = htmltext + constants.LEGEND + constants.QUICK_NOTES;
  const today = new Date().getDay();
  let data = {
    from: 'Town Hall Updates <update@updates.townhallproject.com>',
    to: process.env.ME,
    cc: constants.partnerEmailCC(),
    subject: constants.subjectLinePartner(today, district),
    html: htmltext,
  };
  PartnerEmail.sendEmail(partner, data);
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
  let partner;
  PartnerEmail.sendEmail(partner, data);
};

getLastSent().then(function(lastUpdated){
  getTownHalls(lastUpdated).then(function(){
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
});

module.exports = PartnerEmail;
