const Distance = require('geo-distance');

const firebasedb = require('../lib/setupFirebase');
const TownHall = require('../townhall/model.js');
const sendEmail = require('../lib/sendEmail');

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

class User {
  constructor(opts) {
    this.firstname = false;
    this.lastname = false;
    this.zip = false;
    this.state = false;
    this.lat = false;
    this.lng = false;
    this.primaryEmail = false;
    if (opts.given_name) {
      this.firstname = opts.given_name.trim().toProperCase();
    }
    if (opts.family_name) {
      this.lastname = opts.family_name.trim().toProperCase();
    }
    if (opts.postal_addresses[0].postal_code) {
      this.zip = opts.postal_addresses[0].postal_code.toString();
    }
    if (opts.postal_addresses[0].region) {
      this.state = opts.postal_addresses[0].region;
    }
    if (opts.postal_addresses[0].location.latitude) {
      this.lat = opts.postal_addresses[0].location.latitude;
    }
    if (opts.postal_addresses[0].location.latitude) {
      this.lat = opts.postal_addresses[0].location.latitude;
      this.lng = opts.postal_addresses[0].location.longitude;
    }
    var primaryEmail = false;
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
    var user = this;
    user.districts.forEach(function(district){
      User.usersByDistrict[district] = User.usersByDistrict[district]
        .filter(function(ele){
          return ele.primaryEmail !== user.primaryEmail;
        });
    });
  }

  userReport(){
    var user = this;
    var userTemplate =
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

    var htmltext = `<body style="color:#1E2528; font-size:14px; line-height: 27px;">Hi ${username} - ` +
    '<p>It looks like there\'s one or more events coming up near you! We hope you can attend the event below and bring as many of your community members as possible to amplify your voice.</p>' +
    '<p><span style="text-decoration: underline;">Please read the event details</span> carefully. Note that not all events feature in-person members of Congress.</p>';

    allevents.forEach(function(townhall){
      var townhallHtml = townhall.emailText();
      htmltext = htmltext + townhallHtml;
    });

    htmltext = htmltext +
                `<small>
                    <div><span style="color:#ff4741">Town Hall</span><span> - A forum where members of Congress give updates on the current affairs of Congress and answer questions from constituents.</span></div>
                    <div><span style="color:#ff4741">Empty Chair Town Hall</span><span> - A citizen-organized town hall held with or without the invited lawmaker.</span></div>
                    <div><span style="color:#ff4741">Tele-Town Hall Meeting</span><span> - A town hall conducted by conference call or online.</span></div>
                    <div><span style="color:#ff4741">Other</span><span> - Other opportunities to engage with members of Congress or their staff. Please read details carefully—events in this category can vary.</span></div>
                </small>`;

    htmltext = htmltext + `<p>Quick notes:</p>
    <ul>
      <li>Not sure what to do at a town hall meeting? Our friends at Indivisible have written a terrific guide which we highly recommend: https://www.indivisibleguide.com/
      </li>
      <li>Bring your friends with you. Forward this email to them and ask them to attend.</li>
      <li>Share your <a href="https://goo.gl/forms/JS1mkhMwgPutm5Fh2">Town Hall Stories</a> with us!</li>
      <li>And if you attend, tweet us pictures at @townhallproject or email them to info@townhallproject.com. We'd love to see and hear how it went.</li>
      <li>If you aren't sure if this is your member of Congress, visit http://www.house.gov/representatives/find/ and enter your address to confirm.</li>
    </ul>
    <p>Thank you for your support. <strong>Stand up. Speak out.</strong></p>

    <p>Nathan</p>
    <section style="line-height: 16px; margin-bottom:25px;">
      Nathan Williams<br>
      Managing Director<br>
      Town Hall Project<br>
      townhallproject.com<br>
    </section>
    <p style="text-align:center"><a href="https://secure.actblue.com/contribute/page/townhallprojectemail">Donate here</a></p>
    <footer style="line-height:14px; font-size: 12px;">
    <p>(Paid for by Town Hall Project. All donations to THP are not tax-deductible but help us keep this vital resource sustainable in the months ahead.)</p>
    <small style="font-size: 10px; line-height:12px;">*Compiled by Town Hall Project volunteers. All efforts are made to verify accuracy of events. Event details can change at short notice, please contact your representative to confirm.<small><br>
    </footer>

    </body>`;

    var subject;
    var today = new Date().getDay();
    if (today === 4) {
      subject = `Upcoming Town Hall events near you`;
    } else {
      subject = `Recently added or updated Town Hall events near you`;
    }

    var data = {
      from: 'Town Hall Updates <update@updates.townhallproject.com>',
      // to: `${fullname} <${user.primaryEmail}>`,
      to: 'Megan Riel-Mehan <meganrm@townhallproject.com>',
      subject: subject,
      html: htmltext,
    };
    data['h:Reply-To']='TownHall Project <info@townhallproject.com>';
    User.sentEmails.push(user.primaryEmail);
    user.removeUser();
    setTimeout(function () {
      console.log('queuing', user.primaryEmail);
      sendEmail.user(user, data);
    }, 1000 * (User.sentEmails.length));
  }
  // get senate events given we already know the district of a user
  getSenateEvents() {
    var user = this;
    var state;
    if (user.state) {
      state = user.state;
    } else if (user.districts[0]) {
      state = user.districts[0].split('-')[0];
    }
    state = user.state;
    var senateEvents = [];
    if (TownHall.senateEvents[state]) {
      senateEvents = TownHall.senateEvents[state].reduce(function(acc, cur){
        // if it's a senate phone call, everyone in the state should get the notification
        if (cur.meetingType === 'Tele-Town Hall') {
          acc.push(cur);
        // otherwise only add the event if it's within 50 miles of the person's zip
        } else {
          var dist = Distance.between({ lat: user.lat, lon: user.lng}, { lat: cur.lat, lon: cur.lng});
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
    var user = this;
    for (const key in Object.keys(user)) {
      if (key !== 'districts' && user[key] !== duplicate[key]) {
        if (duplicate[key]) {
          user[key] = duplicate[key];
          console.log('new item', user[key]);
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
      console.log('found duplicate', user.primaryEmail);
      alreadyInArray.forEach(function(ele){
        array[ele.indexInMaster] = ele.person.mergeData(user);
      });
    } else {
      array.push(user);
    }
  }

  checkOtherDistrictEvents(district) {
    var allOtherEvents = [];
    var user = this;
    var districts = user.districts;
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
    var user = this;
    var zipMatch = user.zip.match(/\b\d{5}\b/g);
    return new Promise(function (resolve, reject) {
      if (!zipMatch) {
        User.zipErrors.push(user);
        resolve(index);
      } else {
        var zip = zipMatch[0];
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
                  var district = ele.val()['abr'] + '-' + parseInt(ele.val()['dis']);
                  user.districts.push(district);
                } else {
                  console.log(ele.val());
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
            console.error('zip lookup failed', error);
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
