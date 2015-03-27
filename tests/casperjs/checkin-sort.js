"use strict";

const PORT = require('system').env.PORT;
const BASE = 'http://127.0.0.1:' + PORT;
const SHOTS = 'tests/screenshots/';

casper.test.begin('change sorting of checkin with column clicks', function(test) {
  casper.options.viewportSize = {top: 0, left: 0, width: 1280, height: 720};

  var order_asc_top = null;
  var order_desc_bottom = null;

  casper.start(BASE + '/logmein?as=prabbit', function() {
    test.assertHttpStatus(200, "Login as prabbit");
  });
  casper.thenOpen(BASE, function() {
    test.assertExists('.lpanel.check-in');
    this.click('.lpanel.check-in');
  });
  casper.waitForSelector('#checked-out-items .col-due.header');
  casper.thenClick('#checked-out-items .col-due');
  casper.then(function() {
    order_asc_top = this.evaluate(function(){return document.querySelector('#checked-out-items tr:first-child td[data-date]').getAttribute('data-date');});
    casper.capture(SHOTS + 'checkin-sort-date-asc.png');
  });
  casper.thenClick('#checked-out-items .col-due');
  casper.wait(500);
  casper.then(function() {
    order_desc_bottom = this.evaluate(function(){return document.querySelector('#checked-out-items tr:last-child td[data-date]').getAttribute('data-date');});
    casper.capture(SHOTS + 'checkin-sort-date-desc.png');

    test.assertEquals(order_asc_top, order_desc_bottom);
  });
  casper.then(function(){casper.clear(); test.done()})
  casper.run();
});
