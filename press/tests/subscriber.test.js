const Subscriber = require('../model');
const TownHall = require('../../townhall/tests/mock-townhall-data');
const mockSubscriberOR = { districts: [ 'OR-state-events' ],
  email: 'meghan@email.com',
  name: 'Meghan' };

const mockSubscriberStatesOnly = { districts: 
   [ 'AZ-state-events',
     'PA-state-events',
     'CO-state-events',
     'FL-state-events',
     'ME-state-events',
     'MD-state-events',
     'MI-state-events',
     'NV-state-events',
     'NC-state-events',
     'OR-state-events',
     'VA-state-events' ],
email: 'nwilliams@townhallproject.com',
name: 'Nathan' };

const mockSubscriberState = { districts: [ 'OR-state-events', 'OR' ],
  email: 'sgormady@mainedems.org',
  name: 'Sarah Gormady' };

const mockNotAState = {
  districts: ['BA'],
  email: 'sgormady@mainedems.org',
  name: 'Sarah Gormady',
};

describe('Subscriber', () => {
  describe('constructor', () => {
    test('creates a model with districts as an array', () => {
      let testPerson = new Subscriber(mockSubscriberState);
      expect(testPerson.districts.length).toEqual(2);
    });
  });

  describe('getEventsToSend', () => {
    test('it gets state events for one state', () => {
      let testOrStateEvents = new Subscriber(mockSubscriberOR);
      let eventsToSend = testOrStateEvents.getEventsToSend(TownHall);
      let keys = Object.keys(eventsToSend);
      let check = keys.filter((ele) => {
        return ele.match(/OR-(upper|lower)-\d/g);
      });
      expect(check.length).toEqual(keys.length);
    });
    test ('it gets all state events a user subscribed to', () => {
      let statesOnly = new Subscriber(mockSubscriberStatesOnly);
      let stateEventsToSend = statesOnly.getEventsToSend(TownHall);
      let keys = Object.keys(stateEventsToSend);
      let check = keys.filter((ele) => {
        return ele.match(/[A-Z]{2}-(upper|lower)-\d/g);
      });
      expect(check.length).toEqual(keys.length);
    });
    test('it gets state and federal events for one state', () => {
      let meOnly = new Subscriber(mockSubscriberState);
      let eventsToSend = meOnly.getEventsToSend(TownHall);
      let keys = Object.keys(eventsToSend);
      let check = keys.filter((ele) => {
        return ele.match(/OR-(upper|lower)-\d/g) || ele === 'OR';
      });
      expect(check.length).toEqual(keys.length);
    });
    test('it returns an empty object if no matches', () => {
      let notAState = new Subscriber(mockNotAState);
      let eventsToSend = notAState.getEventsToSend(TownHall);
      let keys = Object.keys(eventsToSend);
      expect(keys.length).toEqual(0);
    });
  });
});

