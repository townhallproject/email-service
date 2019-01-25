const Distance = require('geo-distance');
const { filter, find, map } = require('lodash');
const firebasedb = require('../lib/setupFirebase');
const TownHall = require('../townhall/townhall-model.js');
const sendEmail = require('../lib/send-email');
const constants = require('../email/constants');

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

class User {

  static formatDistrict(district) {
    if (district.abr) {
      let state = district.abr;
      let districtNo = district.dis;
      return `${state}-${parseInt(districtNo)}`;
    }
    if (district.split('-').length === 2) {
      let districtNo = parseInt(district.split('-')[1]);
      let stateAbr = district.split('-')[0].toUpperCase();
      if ((districtNo || districtNo === 0) && stateAbr.match(/[A-Z]{2}/g)[0]) {
        return `${stateAbr.match(/[A-Z]{2}/g)[0]}-${parseInt(district.split('-')[1])}`;
      }
    }
    return false;
  }

  static checkUserCustomDistrictField(districts) {
    let formattedDistricts;
    try {
      districts = districts.replace(/[=>]{2}/g, ':');
    } catch (e) {
      console.log(e, districts);
    }
    if (districts.split('[').length > 1) {
      try {
        districts = JSON.parse(districts);
      } catch (e) {
        console.log(e, districts);
      }
    } 
    
    if (typeof districts === 'string') {
      formattedDistricts = districts.split('-').length === 2 ? [User.formatDistrict(districts)] : [];
    } else if (typeof districts === 'object') {
      formattedDistricts = filter(map(districts, User.formatDistrict), (ele) => !!ele );
    }
    return formattedDistricts;
  }

  constructor(opts) {

    this.firstname = opts.given_name ? opts.given_name.trim().toProperCase(): false;
    this.lastname = opts.family_name ? opts.family_name.trim().toProperCase(): false;

    this.zip =
      opts.postal_addresses[0].postal_code ? opts.postal_addresses[0].postal_code.toString(): false;
    this.state = opts.postal_addresses[0].region || false;

    this.lat = opts.postal_addresses[0].location.latitude || false;
    this.lng = opts.postal_addresses[0].location.longitude || false;
    this.include = true;
    if (
      opts.custom_fields &&
      opts.custom_fields.NoOptIn && 
      opts.custom_fields.NoOptIn === 'Y') {
      this.include = false;
    }
    if (opts.custom_fields && opts.custom_fields.districts) {
      const { districts } = opts.custom_fields;    
      this.districts = User.checkUserCustomDistrictField(districts);
    } else {
      this.districts = [];
    }

    let primaryEmail = false;
    if (opts.email_addresses) {
      opts.email_addresses.forEach(function(ele){
        if (ele.primary === true && ele.status === 'subscribed') {
          primaryEmail = ele.address;
        }
      });
      this.primaryEmail = primaryEmail;
    }
  }

  removeUser (){
    let user = this;
    user.districts.forEach(function(district){
      User.usersByDistrict[district] = User.usersByDistrict[district]
        .filter(function(ele){
          return ele.primaryEmail !== user.primaryEmail;
        });
    });
  }

  userReport(){
    let user = this;
    let userTemplate =
      `<div>${user.firstname}, ${user.primaryEmail}, ${user.zip} </div>`;
    return userTemplate;
  }

  // composes email using the list of events
  composeEmail(district, allevents){
    let username;
    let fullname;
    let user = this;
    if (user.firstname) {
      username = user.firstname;
      if (user.lastname) {
        fullname = `${user.firstname} ${user.lastname}`;
      } else {
        fullname = `${user.firstname}`;
      }
    } else {
      username = 'Friend';
      fullname = '';
    }

    let isTHFOL = find(allevents, {iconFlag : 'mfol'});

    let htmltext = isTHFOL ? constants.introTHFOL(username): constants.intro(username);
    
    allevents.forEach(function(townhall){
      var townhallHtml = townhall.emailText();
      htmltext = htmltext + townhallHtml;
    });

    htmltext = isTHFOL ? htmltext + constants.LEGEND + constants.QUICK_NOTES_THFOL: htmltext + constants.LEGEND + constants.QUICK_NOTES;
    let today = new Date().getDay();

    let data = {
      from: 'Town Hall Updates <update@updates.townhallproject.com>',
      to: constants.emailTo(fullname, user.primaryEmail),
      subject: constants.subjectLine(today),
      html: htmltext,
    };
    data['h:Reply-To']='TownHall Project <info@townhallproject.com>';
    User.sentEmails.push(user.primaryEmail);
    user.removeUser();
    setTimeout(function () {
      if(process.env.NODE_ENV === 'dev'){
        console.log('queuing', user.primaryEmail);
      }
      sendEmail.user(user, data);
    }, 1000 * (User.sentEmails.length));
  }
  // get senate events given we already know the district of a user
  getSenateEvents() {
    let user = this;
    let state;
    if (user.state) {
      state = user.state;
    } else if (user.districts[0]) {
      state = user.districts[0].split('-')[0];
    }
    state = user.state;
    let senateEvents = [];
    if (TownHall.senateEvents[state]) {
      senateEvents = TownHall.senateEvents[state].reduce(function(acc, cur){
        // if it's a senate phone call, everyone in the state should get the notification
        if (cur.meetingType === 'Tele-Town Hall') {
          acc.push(cur);
        // otherwise only add the event if it's within 50 miles of the person's zip
        } else {
          let dist = Distance.between({ lat: user.lat, lon: user.lng}, { lat: cur.lat, lon: cur.lng});
          if (dist < Distance('80 km')) {
            acc.push(cur);
          }
        }
        return acc;
      }, []);
    }
    return senateEvents;
  }

  mergeData (duplicate) {
    let user = this;
    for (let key in Object.keys(user)) {
      if (key !== 'districts' && user[key] !== duplicate[key]) {
        if (duplicate[key]) {
          user[key] = duplicate[key];
        }
      }
    }
    return user;
  }

  checkForDup (array){
    var user = this;
    var  alreadyInArray = array.reduce(function(acc, cur, index){
      var obj = {};
      if (cur.primaryEmail === user.primaryEmail) {
        obj.indexInMaster = index;
        obj.person = cur;
        acc.push(obj);
      }
      return acc;
    }, []);
    if (alreadyInArray.length > 0 ) {
      alreadyInArray.forEach(function(ele){
        array[ele.indexInMaster] = ele.person.mergeData(user);
      });
    } else {
      array.push(user);
    }
  }

  checkOtherDistrictEvents(district) {
    let allOtherEvents = [];
    let user = this;
    let districts = user.districts;
    districts.splice(user.districts.indexOf(district), 1);
    if (districts.length > 0) {
      districts.forEach(function(otherDistrict){
        if (TownHall.townHallbyDistrict[otherDistrict]) {
          allOtherEvents = allOtherEvents.concat(TownHall.townHallbyDistrict[otherDistrict]);
        }
      });
    }
    return allOtherEvents;
  }

  // look up a district based on zip
  // rejects zips that aren't 5 digits
  getDistricts(acc, index){
    let user = this;
    let zipMatch = user.zip.match(/\b\d{5}\b/g);
    return new Promise(function (resolve, reject) {
      if (user.districts && user.districts.length > 0) {
        return resolve(index);
      }
      if (!zipMatch) {
        User.zipErrors.push(user);
        resolve(index);
      } else {
        let zip = zipMatch[0];
        firebasedb.ref('zipToDistrict/' + zip).once('value')
          .then(function (snapshot) {
            if (!snapshot.exists()) {
              if (User.zipsNotInDatabase.indexOf(zip) < 0) {
                User.zipsNotInDatabase.push(zip);
              }
              resolve(index);
            } else {
              user.districts = [];
              snapshot.forEach(function (ele) {
                if (parseInt(ele.val()['dis']) || parseInt(ele.val()['dis']) === 0 ) {
                  let district = ele.val()['abr'] + '-' + parseInt(ele.val()['dis']);
                  user.districts.push(district);
                } else {
                  if (User.zipsNotInDatabase.indexOf(zip) < 0) {
                    User.zipsNotInDatabase.push(zip);
                  }
                }
              });
              user.districts.forEach(function(district){
                if (!acc[district]) {
                  acc[district] = [];
                }
                user.checkForDup(acc[district]);
              });
              resolve(index);
            }
          }).catch(function(error){
            sendEmail.user(user, 'zip lookup failed' + error);
            reject(error);
          });
      }
    });
  }
}

// Global data state
User.usersByDistrict = {};
User.allUsers = [];
User.sentEmails = [];
User.zipErrors = [];
User.zipsNotInDatabase = [];

module.exports = User;
