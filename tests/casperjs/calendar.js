"use strict";

const PORT = require('system').env.PORT;
const BASE = 'http://127.0.0.1:' + PORT;
const SHOTS = 'tests/screenshots/';

casper.test.begin('change sorting of checkin with column clicks', function(test) {
  casper.options.viewportSize = {top: 0, left: 0, width: 1280, height: 720};
  
  casper.start(BASE + '/logmein?as=prabbit', function() {
    test.assertHttpStatus(200, "Login as prabbit");
  });
  
  casper.thenOpen(BASE, function() {
    test.assertExists('.lpanel.calendar');
    this.click('.lpanel.calendar');
  });
  casper.waitForSelector('td[data-time][data-day]:not(.disabled)');
  casper.thenClick('td[data-time][data-day]:not(.disabled)');
  casper.wait(1);
  casper.then(function() {
    casper.capture(SHOTS + 'click-calendar-cell.png');
    test.assertVisible('#popup', 'Calendar popup menu visible after click');
  });
  casper.then(function(){casper.clear(); test.done()})
  casper.run();
});
