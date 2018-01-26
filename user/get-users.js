const https = require('https');
https.globalAgent.maxSockets = Infinity;

const User = require('./model');
const composeEmails = require('./composeEmails');
const makeListbyDistrict = require('./make-list-by-district');
const getDataForUsers = require('./get-data-for-users');

// gets users 25 people at a time
const getUsers = function(path) {
  return new Promise(function (resolve, reject) {
    var options = {
      hostname: 'actionnetwork.org',
      path: path,
      method: 'GET',
      headers: {
        'OSDI-API-Token': process.env.ACTION_NETWORK_KEY,
        'Content-Type': 'application/json' },
    };
    var str = '';
    var req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        str += chunk;
      });
      res.on('end', () => {
        var r = JSON.parse(str);
        if (r) {
          resolve(r);
        } else {
          reject('no users');
        }
      });
    });
    req.on('error', (e) => {
      console.error('error requests', e);
    });
    req.end();
  });
};

const getAllUsers = function(page){
  // first time call page will not be defined
  var basepath = '/api/v2/people';
  var path = page ? basepath + page : basepath;
  // get 25 users, then add them to the object under their district
  getUsers(path).then(function(returnedData) {

    var people = returnedData['_embedded']['osdi:people'];
    var peopleList = [];
    for (const key of Object.keys(people)) {
      var user = new User(people[key]);
      if (user.primaryEmail) {
        peopleList.push(user);
      }
    }
    if (peopleList.length === 0) {
      getDataForUsers();
      return;
    }
    makeListbyDistrict(peopleList).then(function(){
      // if no more new pages, or we set a break point for testing
      if (returnedData && !returnedData['_links']['next']) {
        console.log('got all data');
        getDataForUsers();
      }  else {
        var nextPage = returnedData['_links']['next']['href'].split('people')[1];
        console.log(nextPage);
        getAllUsers(nextPage);
      }
    }).catch(function(error){
      console.error(error);
      composeEmails.errorEmail('making people list ', error);
    });
  }).catch(function(error){
    console.error(error);
    composeEmails.errorEmail('get users error', error);
  });
};

module.exports = getAllUsers;
