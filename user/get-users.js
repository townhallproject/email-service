const request = require('superagent');
const composeEmails = require('./composeEmails');
const processData = require('./process-returned-data');
const composeSummary = require('./composeSummary');

// gets users 25 people at a time
const get25Users = function(path) {
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
        console.log('ERROR GETTING BATCH USERS', e);
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
  get25Users(path).then(function (returnedData) {
    var people = returnedData['_embedded']['osdi:people'];
    if (Object.keys(people).length > 0) {
      processData(people);
    }
  
    if (process.env.NODE_ENV === 'dev') {
      console.log(returnedData['_links']['next']);
    }
    if (returnedData && !returnedData['_links']['next']) {
      console.log('got all users');
      composeSummary();
    } else {
      let nextPage = returnedData['_links']['next']['href'].split('people')[1];
      console.log(nextPage);
      if (nextPage === stoppingPoint) {
        console.log('stopping point');
        composeSummary();
      } else {
        getAllUsers(nextPage);
      }
    }
  }).catch(function(error) {
    console.error('ERROR SENDING USER REQUEST', error);
    composeEmails.errorEmail('getting people', `error:${error} path:${path}`);
  });
};

module.exports = getAllUsers;
