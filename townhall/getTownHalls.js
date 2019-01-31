const firebasedb = require('../lib/setupFirebase');
const TownHall = require('./townhall-model');

module.exports = function(forceInclude){
  return firebasedb.ref('townHalls').once('value')
    .then(function (snapshot) {
      snapshot.forEach(function(ele) {
        var townhall = new TownHall(ele.val());

        if (
          townhall.inNextWeek() &&
          (townhall.include() || forceInclude) &&
          townhall.state
        ) {
          if (!townhall.district && townhall.chamber === 'upper') {
          // get state two letter code
            townhall.addToEventList(TownHall.senateEvents, townhall.state);
          } else if (townhall.district){
            let district = townhall.district === 'At-Large' ? '00' : townhall.district;
            if (!isNaN(Number(district))) {
              townhall.addToEventList(TownHall.townHallbyDistrict, townhall.state + '-' + Number(district));
            }
          } else {
            console.log('not either state or senate', townhall.eventId);
          }
        }
      });
    })
    .then(() => {
      return firebasedb.ref('state_townhalls').once('value')
        .then(snapshot => {
          snapshot.forEach(stateSnapshot => {
            stateSnapshot.forEach(ele => {
              const townHall = new TownHall(ele.val());
              console.log('include?', townHall.include(), townHall.inNextWeek(), townHall.dateString);
              if (
                townHall.inNextWeek() &&
                  (townHall.include() || forceInclude) &&
                  townHall.state
              ) {
                  console.log(TownHall.stateEvents);
                  townHall.addToEventList(TownHall.stateEvents, townHall.state);

              }

            });
          });
        });
    })
    
    .catch(function (error) {
      Promise.reject(error);
    });
};
