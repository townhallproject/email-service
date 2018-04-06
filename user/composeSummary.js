const User = require('./model');
const TownHall = require('../townhall/townhall-model');
const sendEmail = require('../lib/send-email');

module.exports = function(user) {
  let districtreport = 'Districts with events this week: ';
  for (const key of Object.keys(TownHall.townHallbyDistrict)) {
    districtreport = districtreport + `<li>District ${key}, No. of events: ${TownHall.townHallbyDistrict[key].length}</li>`;
  }
  for (const key of Object.keys(TownHall.senateEvents)) {
    districtreport = districtreport + `<li>District ${key}, No. of events: ${TownHall.senateEvents[key].length}</li>`;
  }
  let badZipsReport = 'Users with bad zips: ';
  User.zipErrors.forEach(function(person){
    badZipsReport = badZipsReport + person.userReport();
  });
  badZipsReport = badZipsReport + 'Zips not in database: ';
  User.zipsNotInDatabase.forEach(function(zip){
    badZipsReport = badZipsReport + `<span>'${zip}', </span>`;
  });

  let data = {
    from: 'Town Hall Updates <update@updates.townhallproject.com>',
    to: process.env.ME,
    cc: process.env.NATHAN,
    subject: 'Sent town hall update emails',
    html: `<p>Sent emails to: ${User.sentEmails.length} people</p> <p>${districtreport}</p><p>${badZipsReport}</p>`,
  };
  sendEmail.user(user, data);
};
