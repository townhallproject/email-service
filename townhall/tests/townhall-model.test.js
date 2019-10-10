const moment = require('moment');
const mockData = require('./mock-townhall-data');
const TownHall = require('../townhall-model');

describe('inNextWeek', () => {

  test('if today is the big day, sends all events in the next week', () => {
    let today = moment('2019-10-09T02:00:00');
    let townhallData = {
      dateObj: moment('2019-10-11').valueOf(),
    };
    let newTownHall = new TownHall(townhallData);
    let shouldSend = newTownHall.inNextWeek(today);
    expect(shouldSend).toEqual(true);
  });

  test('if today is a friday, sends events that have been updated, that wont be in the next weekely email', () => {
    let today = moment('2019-10-11T02:00:00');
    let townhallData = {
      dateObj: moment('2019-10-11').valueOf(),
      lastUpdated: moment('2019-10-11'),
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

describe('emailText', () => {
  const stateData = mockData.stateEvents;
  const mockTownHall = new TownHall(stateData['OR-upper-18'][0]);
  const emailText = mockTownHall.emailText();
  expect(emailText.replace(/ /g, '')).toEqual(
    `<divstyle="box-shadow:01px3pxrgba(0,0,0,0.12),01px2pxrgba(0,0,0,0.24);padding:20px;margin-bottom:10px;">
<strongstyle="color:#0d4668">GinnyBurdick(OR-SD-18),<spanstyle="color:#ff4741">TownHall</span></strong>
<small><em></em></small>
<sectionstyle="margin-left:10px;margin-bottom:20px;line-height:20px">
<ul>
<li>TownHallatMultnomahArtsCenter</li>
<li>Sat,Apr132019</li>
<li>1:30PM,PDT</li>
<li>MultnomahArtsCenter</li>
<li>7688SWCapitolHwy,Portland,OR97219</li>
<li><ahref="https://townhallproject.com/oregon?eventId=-Lc6wZWNnX6wBc5FYcJV&state=OR">Linkontownhallprojectsite</a></br>
<p></p>
</ul>
</section>
</div>`
  );
});