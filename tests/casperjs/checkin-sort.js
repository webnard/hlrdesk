const PORT = require('system').env.PORT;
const BASE = 'http://127.0.0.1:' + PORT;
const SHOTS = 'tests/screenshots/';

casper.test.begin('change sorting of checkin with column clicks', function(test) {
  casper.options.viewportSize = {top: 0, left: 0, width: 1280, height: 720};

  casper.start(BASE + '/logmein?as=prabbit', function() {
    test.assertHttpStatus(200, "Login as prabbit");
  })
 .thenOpen(BASE, function() {
    test.assertExists('.lpanel.check-in');
    this.click('.lpanel.check-in');
  })
  .then(function() {
    casper.waitForSelector('#checked-out td[data-date]')
    .then(function() {
      test.assertExists('.tablesorter');
      test.assertExists('#checked-out-items .col-due');

      this.click('#checked-out-items .col-due');
      var order_asc_top = this.evaluate(function(){return document.querySelector('#checked-out-items tr:first-child td[data-date]').getAttribute('data-date');});
      console.log(order_asc_top);
      casper.capture(SHOTS + 'checkin-sort-date-asc.png');

      this.click('#checked-out-items .col-due');
      var order_desc_bottom = this.evaluate(function(){return document.querySelector('#checked-out-items tr:last-child td[data-date]').getAttribute('data-date');});
      casper.capture(SHOTS + 'checkin-sort-date-desc.png');
      console.log(order_desc_bottom);

      test.assertEquals(order_asc_top, order_desc_bottom);
    });
  })
  .then(function(){casper.clear(); test.done()})
  .run();
});
