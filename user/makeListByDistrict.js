// saves chunk of data, resolves when all the people in the list have been assigned a district
const User = require('./model');

module.exports = function(peopleList) {
  return new Promise(function(resolve, reject){
    peopleList.forEach(function(ele, index){
      if (!ele.zip) {
        User.zipErrors.push(ele);
        if (index + 1 === peopleList.length) {
          resolve(true);
        } else {
          reject();
        }
      }
      ele.getDistricts(User.usersByDistrict, index).then(function(curIndex){
        if (curIndex + 1 === peopleList.length) {
          resolve(true);
        }
      }).catch(function(error){
        User.zipErrors.push(ele);
        console.error('couldnt get district', error);
      });
    });
  });
};
