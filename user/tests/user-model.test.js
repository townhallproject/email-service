const User = require('../model');
const mockUserData = require('./mock-user');
const TownHall = require('../../townhall/tests/mock-townhall-data');
describe('getStateEvents', () => {
  test('it returns a list of events matching the district', () => {
    const newUser = new User(mockUserData);
    newUser.stateDistricts = ['OR-lower-30',
      'OR-lower-31',
      'OR-lower-33',
      'OR-lower-34',
      'OR-upper-15',
      'OR-upper-16',
      'OR-upper-17',
    ];
    const stateEvents = newUser.getStateEvents(TownHall.stateEvents);
    expect(stateEvents).toEqual([{
      'Date': 'Thu, Apr 18 2019',
      'Location': 'Jessie Mays Community Center',
      'Member': 'Janeen Sollman',
      'Time': '6:00 PM',
      'address': '30975 NW Hillcrest St, North Plains, OR 97133',
      'chamber': 'lower',
      'dateObj': 1555635600000,
      'dateString': 'Thu, Apr 18 2019',
      'dateValid': true,
      'displayName': 'Janeen Sollman',
      'district': 'HD-30',
      'eventId': '-LbjFaNlrDNj-pvIFNry',
      'eventName': 'North Plains Listen and Learn',
      'iconFlag': 'in-person',
      'lastUpdated': 1554497360581,
      'lat': 45.5987319,
      'link': 'https://content.govdelivery.com/accounts/ORLEG/bulletins/23a7f0e',
      'lng': -122.9960855,
      'meetingType': 'Tele-Town Hall',
      'party': 'Democratic',
      'state': 'OR',
      'stateName': 'Oregon',
      'thp_id': 'OR-HD-30-00',
      'timeEnd': '7:30 PM',
      'timeEnd24': '19:30:00',
      'timeStart24': '18:00:00',
      'timeZone': 'PDT',
      'userID': 'W6MvZpOsb9bcaZCG5X6ifyUoR6z1',
      'yearMonthDay': '2019-04-18',
      'zoneString': 'America/Los_Angeles',
    }]);
  });
});
