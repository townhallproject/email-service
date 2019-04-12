const moment = require('moment');
const Distance = require('geo-distance');
const { filter, find, map, includes } = require('lodash');
const firebasedb = require('../lib/setupFirebase');
const TownHall = require('../townhall/townhall-model.js');
const sendEmail = require('../lib/send-email');
const constants = require('../email/constants');
const {
  formatCongressionalDistrict,
  formatStateKey,
} = require('../lib/formatting-functions');

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

class User {

  static checkUserCustomDistrictField(districts, email) {
    let formattedDistricts = [];
    try {
      districts = districts.replace(/[=>]{2}/g, ':');
    } catch (e) {
      console.log(e, districts, email);
    }
    if (districts.split('[').length > 1) {
      try {
        districts = JSON.parse(districts);
      } catch (e) {
        console.log(e, email);
      }
    } 
    
    if (typeof districts === 'string') {
      if (districts.split(', ').length > 1) {
        formattedDistricts = filter(map(districts.split(', '), formatCongressionalDistrict), (ele) => !!ele);
      } else if (districts.split('-').length === 2) {
        formattedDistricts = [formatCongressionalDistrict(districts)];
      }
    } else if (typeof districts === 'object') {
      formattedDistricts = filter(map(districts, formatCongressionalDistrict), (ele) => !!ele );
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
    this.created_date = opts.created_date;
    this.include = true;
    if (
      opts.custom_fields &&
      opts.custom_fields.NoOptIn && 
      opts.custom_fields.NoOptIn === 'Y') {
      this.include = false;
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
    if (opts.custom_fields && opts.custom_fields.districts) {
      const {
        districts,
      } = opts.custom_fields;
      this.districts = User.checkUserCustomDistrictField(districts, this.primaryEmail);
      this.state = this.districts[0] ? this.districts[0].split('-')[0] : this.state;
    } else {
      this.districts = [];
    }
  }

  userReport(){
    let user = this;
    let userTemplate =
      `<div>${user.firstname}, ${user.primaryEmail}, ${user.zip} </div>`;
    return userTemplate;
  }

  // composes email using the list of events
  composeEmail(allEvents){
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

    let isTHFOL = find(allEvents, {iconFlag : 'mfol'});

    let htmltext = isTHFOL ? constants.introTHFOL(username): constants.intro(username);
    
    allEvents.forEach(function (townhall) {
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
    setTimeout(function () {
      if(process.env.NODE_ENV === 'dev'){
        console.log('queuing', user.primaryEmail, data.to);
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

  // rejects zips that aren't 5 digits
  getDistricts(){
    let user = this;
    // first check if there are already custom districts
    if (this.districts.length > 0) {
      return Promise.resolve();
    }
    // if no custom districts, make sure there is a zip to find districts with
    if (!user.zip) {
      if (moment(user.created_date).isAfter(moment().subtract(7, 'days'))){
        User.zipErrors.push(user);
      }  
      return Promise.reject('no zip');
    }
    let zipMatch = user.zip.match(/\b\d{5}\b/g);
    if (!zipMatch) {
      User.zipErrors.push(user);
      return Promise.reject('not formatted zip');
    }
    let zip = zipMatch[0];
    return firebasedb.ref('zipToDistrict/' + zip).once('value')
      .then(function (snapshot) {
        if (!snapshot.exists()) {
          if (User.zipsNotInDatabase.indexOf(zip) < 0 &&
          moment(user.created_date).isAfter(moment().subtract(7, 'days'))
          ) {
            User.zipsNotInDatabase.push(zip);
          }
        } else {
          snapshot.forEach(function (ele) {
            if (parseInt(ele.val()['dis']) || parseInt(ele.val()['dis']) === 0 ) {
              let district = ele.val()['abr'] + '-' + parseInt(ele.val()['dis']);
              user.districts.push(district);
              user.state = ele.val()['abr'];
            } else {
              if (User.zipsNotInDatabase.indexOf(zip) < 0) {
                User.zipsNotInDatabase.push(zip);
              }
            }
          });
        }
      }).catch(function(error){
        sendEmail.user(user, 'zip lookup failed' + error);
        throw(error);
      });
  }

  lookupStateDistricts(zip, chamber) {
    let user = this;
    return firebasedb.ref(`state_zip_to_district_${chamber}/${this.state}/${this.zip}`).once('value')
      .then((snapshot) => {
        if (!snapshot.exists()) {
          if (User.zipsNotInDatabase.indexOf(zip) < 0 &&
              moment(user.created_date).isAfter(moment().subtract(7, 'days'))
          ) {
            User.zipsNotInDatabase.push(zip);
          }
        } else {
          snapshot.forEach(function (ele) {
            if (parseInt(ele.val()['dis']) || parseInt(ele.val()['dis']) === 0) {
              let district = formatStateKey(ele.val()['abr'], ele.val()['dis'], chamber);
              user.stateDistricts.push(district);
            }
          });
        }
        return user;
      }); 
  }

  getStateDistricts() {
    let user = this;
    user.stateDistricts = [];
    if (!this.zip || !this.state) {
      return Promise.resolve();
    }
    if (!includes(constants.STATE_LEGS, this.state)) {
      return Promise.resolve();
    }
   
    let zipMatch = this.zip.match(/\b\d{5}\b/g);
    if (!zipMatch) {
      return Promise.resolve();
    }
    let zip = zipMatch[0];
    return firebasedb.ref(`state_zip_to_district_lower/${this.state}/${this.zip}`).once('value')
      .then((snapshot) => {
        if (!snapshot.exists()) {
          if (User.zipsNotInDatabase.indexOf(zip) < 0 &&
              moment(user.created_date).isAfter(moment().subtract(7, 'days'))
          ) {
            User.zipsNotInDatabase.push(zip);
          }
        } else {
          snapshot.forEach(function (ele) {
            if (parseInt(ele.val()['dis']) || parseInt(ele.val()['dis']) === 0) {
              let district = `${ele.val()['abr']}-lower-${parseInt(ele.val()['dis'])}`;
              user.stateDistricts.push(district);
            }
          });
        }
        return user;
      }).then((user) => {
        return firebasedb.ref(`state_zip_to_district_upper/${this.state}/${this.zip}`).once('value')
          .then((snapshot) => {
            if (!snapshot.exists()) {
              if (User.zipsNotInDatabase.indexOf(zip) < 0 &&
                moment(user.created_date).isAfter(moment().subtract(7, 'days'))
              ) {
                User.zipsNotInDatabase.push(zip);
              }
            } else {
              snapshot.forEach(function (ele) {
                if (parseInt(ele.val()['dis']) || parseInt(ele.val()['dis']) === 0) {
                  let district = `${ele.val()['abr']}-upper-${parseInt(ele.val()['dis'])}`;
                  user.stateDistricts.push(district);
                }
              });
            }
            return user;
          });
      }); 
  }

  getStateEvents(testEvents) {
    const eventsToCheck = testEvents || TownHall.stateEvents;
    return this.stateDistricts.reduce((acc, district) => {
      if (eventsToCheck[district]) {
        acc = acc.concat(eventsToCheck[district]);
      }
      return acc;
    }, []);
  }

  getDataForUser() {
    if (User.sentEmails.indexOf(this.primaryEmail) > 0) {
      console.log('user already got email', this.primaryEmail);
      return [];
    } 
    if (!this.districts || this.districts.length === 0) {
      return [];
    }
    let allevents = [];
    this.districts.forEach(function (district) {
      if (TownHall.townHallbyDistrict[district]) {
        allevents = allevents.concat(TownHall.townHallbyDistrict[district]);
      }
    });
    let senateEvents = this.getSenateEvents();
    let stateEvents = this.stateDistricts.length > 0 ? this.getStateEvents() : [];
    allevents = senateEvents.length > 0 ? allevents.concat(senateEvents) : allevents;
    allevents = stateEvents.length > 0 ? allevents.concat(stateEvents) : allevents;
    return allevents;
  }
}

// Global data state
User.sentEmails = [];
User.zipErrors = [];
User.zipsNotInDatabase = [];

module.exports = User;
