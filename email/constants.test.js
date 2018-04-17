const constants = require('./constants');

describe('constants', () => {

  describe('subjectLinePartner', () => {

    test('it returns a subject line given a day and a district', () => {
      let today = 0;
      let result = constants.subjectLinePartner(today, 'district');
      expect(result).toEqual('Recently added or updated Town Hall events in district');
    });

    test('it returns a subject line given a day and a district', () => {
      let today = constants.BIG_DAY;
      let result = constants.subjectLinePartner(today, 'district');
      expect(result).toEqual('district Town Hall events this week');
    });

  });

  describe('subjectLine', () => {

    test('it returns a subject line given a day', () => {
      let today = 0;
      let result = constants.subjectLine(today);
      expect(result).toEqual('Recently added or updated Town Hall events near you');
    });

    test('it returns a subject line given a day', () => {
      let today = constants.BIG_DAY;
      let result = constants.subjectLine(today);
      expect(result).toEqual('Upcoming Town Hall events near you');
    });

  });

  describe('partnerEmailCC', () => {

    test('if not production returns nothing', () => {
      process.env.NODE_ENV = 'dev';
      let result = constants.partnerEmailCC();
      expect(result).toEqual('');
    });

    test('it returns partner emails if in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.PARTNERS = 'partners';
      let result = constants.partnerEmailCC();
      expect(result).toEqual('partners');
    });

  });

  describe('emailTo', () => {

    test('if not production returns me', () => {
      process.env.NODE_ENV = 'dev';
      process.env.ME = 'me';
      let result = constants.emailTo();
      expect(result).toEqual('me');
    });

    test('it returns user email if in production', () => {
      process.env.NODE_ENV = 'production';
      let result = constants.emailTo('fullname', 'email');
      expect(result).toEqual('fullname <email>');
    });

  });

});
