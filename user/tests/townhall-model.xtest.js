const moment = require('moment');

const TownHall = require('../townhall-model');

describe('inNextWeek', () => {

  test('if today is the big day, sends all events in the next week', () => {
    let today = moment('2018-04-05T02:00:00');
    let townhallData = {
      dateObj: moment('2018-04-07').valueOf(),
    };
    let newTownHall = new TownHall(townhallData);
    let shouldSend = newTownHall.inNextWeek(today);
    expect(shouldSend).toEqual(true);
  });

  test('if today is a friday, sends events that have been updated, that wont be in the next weekely email', () => {
    let today = moment('2018-04-06T02:00:00');
    let townhallData = {
      dateObj: moment('2018-04-08').valueOf(),
      lastUpdated: moment('2018-04-06'),
    };
    let newTownHall = new TownHall(townhallData);
    let shouldSend = newTownHall.inNextWeek(today);
    expect(shouldSend).toEqual(true);
  });

  test('if today is a friday, does not send events that have not been updated', () => {
    let today = moment('2018-04-06');
    let townhallData = {
      dateObj: moment('2018-04-07').valueOf(),
      lastUpdated: moment('2018-04-04'),
    };
    let newTownHall = new TownHall(townhallData);
    let shouldSend = newTownHall.inNextWeek(today);
    expect(shouldSend).toEqual(false);
  });

  test('if today is a tuesday, will not send those after the following big day', () => {
    let today = moment('2018-04-03');
    let townhallData = {
      dateObj: moment('2018-04-06').valueOf(),
      lastUpdated: moment('2018-04-04'),
    };
    let newTownHall = new TownHall(townhallData);
    let shouldSend = newTownHall.inNextWeek(today);
    expect(shouldSend).toEqual(false);
  });
  
  test('if today is a tuesday, will not send those that havent been updated since last weekly', () => {
    let today = moment('2018-04-03');
    let townhallData = {
      dateObj: moment('2018-04-03').valueOf(),
      lastUpdated: moment('2018-03-28'),
    };
    let newTownHall = new TownHall(townhallData);
    let shouldSend = newTownHall.inNextWeek(today);
    expect(shouldSend).toEqual(false);
  });
});
