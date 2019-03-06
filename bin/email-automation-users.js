#!/usr/bin/env node

const User = require('../user/model');
const getTownHalls = require('../townhall/getTownHalls');
const getUsers = require('../user/get-users');
const TownHall = require('../townhall/townhall-model');

console.log('NODE_ENV:', process.env.NODE_ENV);

getTownHalls().then(function(){
  console.log('got events');
  console.log('state events', Object.keys(TownHall.stateEvents));
  console.log('senate events', Object.keys(TownHall.senateEvents));
  console.log('district events', Object.keys(TownHall.townHallbyDistrict));
  // enter '?page=200' if you want to start at specific page
  getUsers();
});

module.exports = User;
