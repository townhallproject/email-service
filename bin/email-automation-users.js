#!/usr/bin/env node

const User = require('../user/model');
const getLastSent = require('../townhall/getLastSent');
const getTownHalls = require('../townhall/getTownHalls');
const getUsers = require('../user/get-users');

console.log('NODE_ENV:', process.env.NODE_ENV);

getLastSent().then(function(lastUpdated){
  getTownHalls(lastUpdated).then(function(){
    console.log('got events');
    // enter '?page=200' if you want to start at specific page
    getUsers('?page=4');
  });
});

module.exports = User;
