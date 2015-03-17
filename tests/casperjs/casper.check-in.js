const PORT = require('system').env.PORT;
const BASE = 'http://127.0.0.1:' + PORT;
const SHOTS = 'tests/screenshots/';

casper.options.viewportSize = {top: 0, left: 0, width: 1280, height: 720};

casper.test.begin('check in', function(test) {
  casper.start(BASE + '/logmein?as=prabbit', function() {
    test.assertHttpStatus(200, "Login as prabbit");
  })
 .thenOpen(BASE, function() {
    test.assertExists('.lpanel.check-in');
    this.click('.lpanel.check-in');
  })
  .then(function() {
    casper.waitFor(function(){return casper.exists('#checked-out-items')}, function then() {
      test.assertExists('#checked-out-items');
      casper.capture(SHOTS + 'checked-out-items-list.png');
    });
  })
  .then(function(){test.done()})
  .run();
});

