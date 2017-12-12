const firebasedb = require('../lib/setupFirebase');

module.exports = function() {
  return firebasedb.ref('emailLastSent/').once('value').then(function (snapshot) {
    if (snapshot.val()) {
      console.log(snapshot.val());
      return (snapshot.val());
    } else {
      Promise.reject ('no last date');
    }
  });
};
