#!/usr/bin/env node

const User = require('../user/model');
const getTownHalls = require('../townhall/getTownHalls');
const getUsers = require('../user/get-users');

console.log('NODE_ENV:', process.env.NODE_ENV);

getTownHalls().then(function(){
  console.log('got events');
  // enter '?page=200' if you want to start at specific page
  getUsers();
});

module.exports = User;
