const firebasedb = require('../lib/setupFirebase.js');

module.exports = function() {
  var today = new Date().getDay();
  var now = Date.now();
  console.log(now);
  if (today === 4) {
    console.log('Thursday');
    firebasedb.ref('emailLastSent/weekly').set(now);
  }
  console.log('setting daily');
  firebasedb.ref('emailLastSent/daily').set(now);
};
