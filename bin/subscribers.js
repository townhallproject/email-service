#!/usr/bin/env node

require('dotenv').load();

const firebasedb = require('../lib/setupFirebase');
const getTownHalls = require('../townhall/getTownHalls');
const Press = require('../press/model');
const TownHall = require('../townhall/townhall-model');

firebasedb.ref('subscribers/').once('value').then(subscribers => {
  getTownHalls(true).then(function () {
    console.log('got events');
    subscribers.forEach(subscriberRef => {
      const subscriber = new Press(subscriberRef.val());
      let townHallsToSend = subscriber.getEventsToSend(TownHall);
      const sendTo = process.env.NODE_ENV === 'production' ? subscriber.email : process.env.GMAIL;
      if (Object.keys(townHallsToSend).length > 0) {
        console.log('sending subscribers emails', subscriber.email, sendTo);
        Press.composeEmail(townHallsToSend, subscriber.name, sendTo);
      }
    });
  }).catch(console.log);
});
