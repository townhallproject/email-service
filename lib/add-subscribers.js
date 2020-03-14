 
const firebasedb = require('./setupFirebase');
const newSubscribers = [];

const addSubscribers = () => {
  newSubscribers.forEach(person => {
    firebasedb.ref(`subscribers/`).push(person);
  });
};

addSubscribers();