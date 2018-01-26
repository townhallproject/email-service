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
          console.log('senate', townhall.state);
          townhall.addToEventList(TownHall.senateEvents, townhall.state);
        } else {
          console.log('district', townhall.state + '-' + Number(townhall.district));
          townhall.addToEventList(TownHall.townHallbyDistrict, townhall.state + '-' + Number(townhall.district));
        }
      }
    });
    console.log(TownHall.townHallbyDistrict);
    console.log(TownHall.senateEvents);
  }).catch(function (error) {
    Promise.reject(error);
  });
};
