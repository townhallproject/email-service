const constants = {};

constants.BIG_DAY = 4; //Thursday

constants.intro = function(username){
  return `<body style="color:#1E2528; font-size:14px; line-height: 27px;">Hi ${username} - ` +
    '<p>It looks like there\'s one or more events coming up near you! We hope you can attend the event below and bring as many of your community members as possible to amplify your voice.</p>' +
    '<p><span style="text-decoration: underline;">Please read the event details</span> carefully. Note that not all events feature lawmakers in person.</p>';
};

constants.introTHFOL = function (username) {
  return `<body style="color:#1E2528; font-size:14px; line-height: 27px;">Hi ${username} - ` +
    '<p>It looks like there\'s one or more events coming up near you and at least one is a <strong>Town Hall For Our Lives</strong>! We hope you can attend the event below and bring as many of your community members as possible to amplify your voice.</p>' +
    '<p>If you are attending a <strong>Town Hall For Our Lives</strong> event, here is some material from other organizations that could be used to help spur conversation on this issue. Please consider these suggestions--Town Hall Project encourages an open, honest discussion in which all viewpoints feel welcome expressing their views: </p>' +
    '<ul style="list-style:none">' + 
    '<li><a href="https://marchforourlives.com/mission-statement/">March For Our Lives</a></li>' +
    '<li><a href="https://www.indivisible.org/resource/town-hall-lives-sample-questions/">Indivisible</a></li>' + 
    '<li><a href="https://www.ofa.us/get-trained/toolkits-resources/gvp-questions/">Organizing For Action</a></li>' +   
    '</ul>' + 
    '<p>At the end of the day, this is you conversation.This moment belongs to you.</p>' +
    '<p><span style="text-decoration: underline;">Please read the event details</span> carefully. Note that not all events feature lawmakers in person.</p>';
};

constants.LEGEND = `
              <small>
                  <div style="padding:0; "><span style="color:#ff4741">Town Hall</span><span> - A forum where members of Congress give updates on the current affairs of Congress and answer questions from constituents.</span></div>
                  <div style="padding:0; "><span style="color:#ff4741">Empty Chair Town Hall</span><span> - A citizen-organized town hall held with or without the invited lawmaker.</span></div>
                  <div style="padding:0; "><span style="color:#ff4741">Tele-Town Hall Meeting</span><span> - A town hall conducted by conference call or online.</span></div>
                  <div style="padding:0; "><span style="color:#ff4741">Campaign Town Hall</span><span> - A town hall organized by a candidate for office - whether an incumbent or challenger. (Town Hall Project includes these events as a public resource--not to endorse a particular candidate or campaign)</span></div>
                  <div style="padding:0; "><span style="color:#ff4741">Other</span><span> - Other opportunities to engage with members of Congress or their staff. Please read details carefully—events in this category can vary.</span></div>
              </small>`;

constants.QUICK_NOTES = `<p>Quick notes:</p>
    <ul>
      <li>Register to vote! If you aren’t already registered--or need to update after moving--find the voter registration table and make sure to get registered!</li>
      <li>Bring your friends with you. Forward this email to them and ask them to attend.</li>
      <li>You don’t have to be a policy expert--the most powerful thing you can do is share your story and convey why this issue is important to you.</li>
      <li>Make sure somebody asks your Member of Congress when their next town hall is. Let them know you consider this part of their job.</li>
      <li>Take photos and video! Tweet us pictures at @townhallproject, post them on Instagram or Facebook, or email them to info@townhallproject.com. We’d love to see and hear how it went.</li>
      <li>Talk to the other people there with you. An in-person town hall is not just an opportunity to speak to your lawmaker but an opportunity to build community on common issues, to organize, and to take back our democracy.</li>
      <li>We also recommend Indivisible’s <a href="https://www.indivisible.org/resource/successful-town-hall-tips/">How to Have a Succesful Town Hall guide.</a></li>
    </ul>
  <p>Thank you for your support. <strong>Stand up. Speak out.</strong></p>

  <p>Nathan</p>
  <section style="line-height: 16px; margin-bottom:25px;">
  Nathan Williams<br>
  Managing Director<br>
  Town Hall Project<br>
  townhallproject.com<br>
  </section>
  <footer style="line-height:14px; font-size: 12px;">
  <small style="font-size: 10px; line-height:12px;">*Compiled by Town Hall Project volunteers. All efforts are made to verify accuracy of events. Event details can change at short notice, please contact your representative to confirm.<small><br>
  </footer>
  
  </body>`;
  

constants.QUICK_NOTES_THFOL = `<p>Quick notes:</p>
    <ul>
      <li>Register to vote! If you aren’t already registered--or need to update after moving--find the voter registration table and make sure to get registered!</li>
      <li>Bring your friends with you. Forward this email to them and ask them to attend.</li>
      <li>You don’t have to be a policy expert--the most powerful thing you can do is share your story and convey why this issue is important to you.</li>
      <li>Make sure somebody asks your Member of Congress when their next town hall is. Let them know you consider this part of their job.</li>
      <li>Take photos and video! Tweet us pictures at @townhallproject, post them on Instagram or Facebook, or email them to info@townhallproject.com. We’d love to see and hear how it went.</li>
      <li>Talk to the other people there with you. An in-person town hall is not just an opportunity to speak to your lawmaker but an opportunity to build community on common issues, to organize, and to take back our democracy.</li>
      <li>We also recommend Indivisible’s <a href="https://www.indivisible.org/resource/successful-town-hall-tips/">How to Have a Succesful Town Hall guide.</a></li>
    </ul>
  <p>Thank you for your support. <strong>Stand up. Speak out.</strong></p>

  <p>Nathan</p>
  <section style="line-height: 16px; margin-bottom:25px;">
  Nathan Williams<br>
  Managing Director<br>
  Town Hall Project<br>
  townhallproject.com<br>
  </section>
  <footer style="line-height:14px; font-size: 12px;">
  <p style="text-align:center"><a href="https://secure.actblue.com/contribute/page/townhallprojectemail">Donate here</a></p>
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

constants.emailTo = function (fullname, email) {
  if (process.env.NODE_ENV === 'production') {
    return `${fullname} <${email}>`;
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
  Jenita`;
  return copy;
};

constants.pressDistricts = {
  reuters:['AZ-01',
    'AZ-02',
    'AZ-06',
    'CA-10',
    'CA-22',
    'CA-25',
    'CA-36',
    'CA-39',
    'CA-45',
    'CA-48',
    'CA-49',
    'CO-06',
    'CT-02',
    'FL-13',
    'FL-18',
    'FL-25',
    'FL-26',
    'FL-27',
    'FL-07',
    'GA-6',
    'GA-7',
    'IA-01',
    'IA-02',
    'IA-03',
    'IL-12',
    'IL-13',
    'IL-14',
    'IL-17',
    'IL-06',
    'KS-02',
    'KS-03',
    'KY-06',
    'MI-11',
    'MI-03',
    'MI-05',
    'MI-06',
    'MI-08',
    'MN-01',
    'MN-02',
    'MN-03',
    'MN-08',
    'NC-13',
    'NC-02',
    'NE-02',
    'NH-01',
    'NH-02',
    'NJ-11',
    'NJ-02',
    'NJ-03',
    'NJ-05',
    'NJ-07',
    'NV-03',
    'NY-11',
    'NY-18',
    'NY-19',
    'NY-02',
    'NY-22',
    'NY-24',
    'NY-03',
    'NY-04',
    'OH-01',
    'OH-10',
    'OH-13',
    'OR-04',
    'OR-05',
    'PA-01',
    'PA-17',
    'PA-06',
    'PA-07',
    'RI-02',
    'TX-10',
    'TX-22',
    'TX-23',
    'TX-24',
    'TX-32',
    'TX-07',
    'UT-04',
    'VA-10',
    'VA-02',
    'VA-07',
    'WA-03',
    'WA-08',
    'WI-1',
    'WI-03',
    'IN',
    'AZ',
    'MO',
    'ND',
    'NV',
    'FL',
    'OH',
    'WV'],
};
module.exports = constants;
