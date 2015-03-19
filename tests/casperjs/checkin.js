"use strict";
const PORT = require('system').env.PORT;
const BASE = 'http://127.0.0.1:' + PORT;
const SHOTS = 'tests/screenshots/';

casper.test.begin('check in', function(test) {
  casper.options.viewportSize = {top: 0, left: 0, width: 1280, height: 720};

  casper.start(BASE + '/logmein?as=prabbit', function() {
    test.assertHttpStatus(200, "Login as prabbit");
  });
  casper.thenOpen(BASE, function() {
    test.assertExists('.lpanel.check-in');
    this.click('.lpanel.check-in');
  });
  casper.waitForSelector('#checked-out-items');
  casper.capture(SHOTS + 'checked-out-items-list.png');
  casper.then(function(){casper.clear(); test.done()});
  casper.run();
});
