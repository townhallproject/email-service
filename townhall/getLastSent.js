const firebasedb = require('../lib/setupFirebase');

module.exports = function() {
  return new Promise(function (resolve, reject) {
    firebasedb.ref('emailLastSent/').once('value').then(function (snapshot) {
      if (snapshot.val()) {
        console.log(snapshot.val());
        resolve(snapshot.val());
      } else {
        reject ('no last date');
      }
    });
  });
};
