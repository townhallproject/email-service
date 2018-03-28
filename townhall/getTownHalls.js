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
        if (!townhall.district) {
          // get state two letter code
          townhall.addToEventList(TownHall.senateEvents, townhall.state);
        } else {
          townhall.addToEventList(TownHall.townHallbyDistrict, townhall.state + '-' + Number(townhall.district));
        }
      }
    });
  }).catch(function (error) {
    Promise.reject(error);
  });
};
