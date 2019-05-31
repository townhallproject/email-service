#!/usr/bin/env node

const getTownHalls = require('../townhall/getTownHalls');
const TownHall = require('../townhall/townhall-model');
console.log('NODE_ENV:', process.env.NODE_ENV);

getTownHalls().then(function(){
  console.log('got events');
  console.log(TownHall.stateEvents);
}).catch(console.log);
