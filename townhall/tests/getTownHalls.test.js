const TownHall = require('../townhall-model');
const getTownHalls = require('../getTownHalls');

describe('get town halls', () => {
  test('it gets town halls and passes them into mappings', () => {
    return getTownHalls().then(() => {
      console.log(TownHall.townHallbyDistrict)
      expect(typeof TownHall.townHallbyDistrict).toBe('object');
      expect(typeof TownHall.senateEvents).toBe('object');
    });
  });
});
