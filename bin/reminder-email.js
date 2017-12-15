#!/usr/bin/env node

const moment = require('moment');

const firebasedb = require('../lib/setupFirebase');
const Researcher = require('../researcher/model');
const constants = require('../email/constants');

function getmocName(mocID, days){
  return new Promise(function(resolve, reject) {
    firebasedb.ref(`mocData/${mocID}`).once('value').then(function(moc){
      resolve({name: moc.val().displayName, days: days});
    }).catch((error) => {
      reject(error);
    });
  });
}

function loopThroughMocs(mocs){
  let report = [];
  return new Promise(function(resolve, reject) {
    let mocIDs = Object.keys(mocs);
    mocIDs.forEach(function(mocID, index){
      if (mocs[mocID].isAssigned){
        let now = moment();
        let timeAgo = moment(mocs[mocID].lastUpdated);
        let days = now.diff(timeAgo, 'days');
        if (days > 8 ) {
          getmocName(mocID, days).then(function(result){
            report.push(result.name);
            if (index + 1 === mocIDs.length){
              resolve(report);
            }
          }).catch((error) => {
            reject(error);
          });
        }
      }
    });
  });
}

firebasedb.ref('users/').once('value').then(function(snapshot){
  snapshot.forEach(function(researcher){
    let newResearcher = new Researcher(researcher.val());
    let mocs = newResearcher.mocs;
    if (mocs) {
      loopThroughMocs(mocs).then(function(report){
        let html = constants.compileMocReport(report);
        newResearcher.composeEmail(html);
      });
    }
  });
});

module.exports = Researcher;
