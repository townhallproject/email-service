const firebasedb = require('../lib/setupFirebase');
const TownHall = require('./model');
const statesAb = require('../lib/states-abbr');

module.exports = function(lastUpdated){
  return new Promise(function (resolve, reject) {
    firebasedb.ref('townHalls').once('value').then(function (snapshot) {
      snapshot.forEach(function(ele) {
        var townhall = new TownHall(ele.val());
        if (townhall.District && townhall.inNextWeek(lastUpdated) && townhall.include()) {
          if (townhall.District === 'Senate') {
              // get state two letter code
            for (const key of Object.keys(statesAb)) {
              if (statesAb[key] == townhall.State) {
                var state = key;
              }
            }
            townhall.addToEventList(TownHall.senateEvents, state);
          } else {
            townhall.addToEventList(TownHall.townHallbyDistrict, townhall.District);
          }
        }
      });
    }).then(function(){
      resolve();
    }).catch(function (error) {
      reject(error);
    });
  });
};
