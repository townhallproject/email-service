const TownHall = require('../townhall/model');
const User = require('./model');

const composeSummary = require('./composeSummary');
const setLastEmailTime = require('../townhall/setLastEmailTime');

module.exports = function() {
  // starting with district events,find all users in district
  // for each user in the group, also get other district and senate events
  // once an email is sent, they'll be removed from the user object
  for (const key of Object.keys(TownHall.townHallbyDistrict)) {
    if (User.usersByDistrict[key]) {
      console.log('sending district emails', key, User.usersByDistrict[key].length);
      User.usersByDistrict[key].forEach(function(user, index){
        if (User.sentEmails.indexOf(user.primaryEmail) > 0 ) {
          console.warn('user already got email', user.primaryEmail);
        } else {
          var allevents = TownHall.townHallbyDistrict[key];
          var otherDistrict = user.checkOtherDistrictEvents(key);
          var senateEvents = user.getSenateEvents();
          allevents = otherDistrict.length > 0? allevents.concat(otherDistrict): allevents;
          allevents = senateEvents.length > 0 ? allevents.concat(senateEvents): allevents;
          user.composeEmail(key, allevents, index);
        }
      });
    }
  }
  // for all senate events, send emails to who haven't already gotten one.
  for (const state of Object.keys(TownHall.senateEvents)) {
    var usersInState = [];
    for (const district of Object.keys(User.usersByDistrict)) {
      if (district.split('-')[0] === state) {
        usersInState = usersInState.concat(User.usersByDistrict[district]);
      }
    }
    console.log('sending senate emails', state, usersInState.length);
    usersInState.forEach(function(user, index){
      if ( User.sentEmails.indexOf(user.primaryEmail) === -1 ) {
        var senateEvents = user.getSenateEvents();
        if (senateEvents.length > 0) {
          user.composeEmail(state, senateEvents, index);
        }
      } else {
        // TODO: this check shouldn't be needed.
        console.warn('user already had a email sent',  user.primaryEmail);
      }

    });
  }
  setLastEmailTime();
  composeSummary();
};
