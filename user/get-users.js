const request = require('superagent');

const User = require('./model');
const composeEmails = require('./composeEmails');
const makeListbyDistrict = require('./make-list-by-district');
const getDataForUsers = require('./get-data-for-users');

// gets users 25 people at a time
const getUsers = function(path) {
  return request
    .get(`https://actionnetwork.org/${path}`)
    .set('OSDI-API-Token', process.env.ACTION_NETWORK_KEY)
    .set('Content-Type', 'application/json')
    .then((res) => {
      let data;
      try {
        data = JSON.parse(res.text);
        return (data);
      } catch (e) {
        console.log(e);
        throw (e);
      }
    });
};
const stoppingPoint = '';
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
      console.log('no users');
      getDataForUsers();
      return;
    }
    makeListbyDistrict(peopleList).then(function(){
      // if no more new pages, or we set a break point for testing
      console.log(returnedData['_links']['next']);
      if (returnedData && !returnedData['_links']['next']) {
        console.log('got all users');
        getDataForUsers();
      } else {
        var nextPage = returnedData['_links']['next']['href'].split('people')[1];
        console.log(nextPage);
        if (nextPage === stoppingPoint){
          console.log('stopping point');
          getDataForUsers();
        } else {

          getAllUsers(nextPage);
        }
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
