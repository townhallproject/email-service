const firebasedb = require('../lib/setupFirebase');
const TownHall = require('./model');

module.exports = function(lastUpdated){
  return firebasedb.ref('townHalls').once('value').then(function (snapshot) {
    snapshot.forEach(function(ele) {
      var townhall = new TownHall(ele.val());

      if (
        townhall.inNextWeek(lastUpdated) &&
          townhall.include() &&
          townhall.state
      ) {
        if (!townhall.district && townhall.chamber === "upper") {
          // get state two letter code
          townhall.addToEventList(TownHall.senateEvents, townhall.state);
        } else if (townhall.district){
          townhall.addToEventList(TownHall.townHallbyDistrict, townhall.state + '-' + Number(townhall.district));
        } else {
          console.log(townhall.eventId);
        }
      }
    });
  }).catch(function (error) {
    Promise.reject(error);
  });
};
