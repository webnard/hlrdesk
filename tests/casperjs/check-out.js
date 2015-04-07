"use strict";

const PORT = require('system').env.PORT;
const BASE = 'http://127.0.0.1:' + PORT;
const SHOTS = 'tests/screenshots/';

casper.test.begin('check out page', function(test) {
  casper.options.viewportSize = {top: 0, left: 0, width: 1280, height: 720};
  casper.start(BASE + '/logmein?as=prabbit', function() {
    test.assertHttpStatus(200, "Login as prabbit");
  });
  casper.thenOpen(BASE, function() {
    test.assertExists('.lpanel.check-out');
    this.click('.lpanel.check-out');
  });
  casper.waitForSelector('#check-out');
  casper.then(function() {
    casper.sendKeys('#check-out-search', 'DEADBEEF', {keepFocus: false});
  });
  casper.then(function() {
    // should be disabled initially
    test.assertExists('#check-out .check-out-btn[disabled]');
  });
  casper.then(function() {
    this.wait(500).then(function() {
      casper.capture(SHOTS + 'checkout-DEADBEEF-search.png');
      test.assertElementCount('#check-out-search-results .satchel li', 1);
      test.assertElementCount('#check-out-search-selection .satchel li', 0);
    });
  });
  casper.then(function() {
    this.click('#check-out-search-results .satchel li');
    this.wait(500).then(function() {
      casper.capture(SHOTS + 'checkout-added-to-satchel.png');
      test.assertExists('#check-out .check-out-btn:not([disabled])');
      test.assertElementCount('#check-out-search-results .satchel li', 0);
      test.assertElementCount('#check-out-search-selection .satchel li', 1);
    });
  });
  casper.then(function(){casper.clear(); test.done()})
  casper.run();
});
