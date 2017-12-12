const moment = require('moment');

const TownHall = require('../model');
const getTownHalls = require('../getTownHalls');

describe('get town halls', () => {
  test('it gets town halls and puses them into mappings', () => {
    let lastUpdated = {
      daily: moment().subtract(1, 'hours'),
      weekly: moment().subtract(4, 'days') };
    return getTownHalls(lastUpdated).then(() => {
      expect(typeof TownHall.townHallbyDistrict).toBe('object');
      expect(typeof TownHall.senateEvents).toBe('object');
    });
  });
});
