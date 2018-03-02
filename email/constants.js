const constants = {};

constants.BIG_DAY = 5; //Friday

constants.intro = function(username){
  return `<body style="color:#1E2528; font-size:14px; line-height: 27px;">Hi ${username} - ` +
    '<p>It looks like there\'s one or more events coming up near you! We hope you can attend the event below and bring as many of your community members as possible to amplify your voice.</p>' +
    '<p><span style="text-decoration: underline;">Please read the event details</span> carefully. Note that not all events feature lawmakers in person.</p>';
};

constants.LEGEND = `<small>
                  <div><span style="color:#ff4741">Town Hall</span><span> - A forum where members of Congress give updates on the current affairs of Congress and answer questions from constituents.</span></div>
                  <div><span style="color:#ff4741">Empty Chair Town Hall</span><span> - A citizen-organized town hall held with or without the invited lawmaker.</span></div>
                  <div><span style="color:#ff4741">Tele-Town Hall Meeting</span><span> - A town hall conducted by conference call or online.</span></div>
                  <div><span style="color:#ff4741">Campaign Town Hall</span><span> - A town hall organized by a candidate for office - whether an incumbent or challenger. (Town Hall Project includes these events as a public resource--not to endorse a particular candidate or campaign)</span></div>
                  <div><span style="color:#ff4741">Other</span><span> - Other opportunities to engage with members of Congress or their staff. Please read details carefully—events in this category can vary.</span></div>
              </small>`;

constants.QUICK_NOTES =  `<p>Quick notes:</p>
    <ul>
    <li>Not sure what to do at a town hall meeting? Our friends at Indivisible have written a terrific guide which we highly recommend: https://www.indivisibleguide.com/
    </li>
    <li>Bring your friends with you. Forward this email to them and ask them to attend.</li>
    <li>Share your <a href="https://goo.gl/forms/JS1mkhMwgPutm5Fh2">Town Hall Stories</a> with us!</li>
    <li>And if you attend, tweet us pictures at @townhallproject or email them to info@townhallproject.com. We’d love to see and hear how it went.</li>
    <li>If you aren’t sure if this is your member of Congress, visit http://www.house.gov/representatives/find/ and enter your address to confirm.</li>
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

constants.subjectLinePartner = function (today, district) {
  if (today === constants.BIG_DAY) {
    return `${district} Town Hall events this week`;
  }
  return `Recently added or updated Town Hall events in ${district}`;
};

constants.subjectLine = function (today) {
  if (today === constants.BIG_DAY) {
    return `Upcoming Town Hall events near you`;
  }
  return `Recently added or updated Town Hall events near you`;
};

constants.partnerEmailCC = function () {
  if (process.env.NODE_ENV === 'production') {
    return process.env.PARTNERS;
  }
  return '';
};

constants.emailTo = function (fullname, user) {
  if (process.env.NODE_ENV === 'production') {
    return `${fullname} <${user.primaryEmail}>`;
  }
  return process.env.ME;
};

constants.compileMocReport = function (mocs){
  let names = mocs.slice(0, -1).join(', ') + ' or ' +  mocs[mocs.length - 1];
  let copy = `Hi!<br>
  <p>We haven't received any event submissions (including "No New Events") for <span style="color:#ff4741">${names}</span> in a week. Remember, you are the only researcher assigned to these members of Congress, so if you aren't able to do the research these constituents could be missing vital opportunities to make their voices heard.</p>
  <p>If you aren't able to continue volunteering with Town Hall Project, please respond to this email with "PLEASE REASSIGN" and we'll assign a new volunteer to these MoCs. No hard feelings!</p>
  <p>If you are able to continue (and we hope you are!) please make sure to submit your research OR a "No New Event" submission for every MoC by end of day each Monday and Friday. As always, my research leads and I are always happy to answer questions about the process or provide best practices on event research.</p>
  <p>Thank you for all you do!</p>
  Best,<br>
  Emily`;
  return copy;
};

module.exports = constants;
