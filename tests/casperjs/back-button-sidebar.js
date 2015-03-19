const PORT = require('system').env.PORT;
const BASE = 'http://127.0.0.1:' + PORT;
const SHOTS = 'tests/screenshots/';

casper.test.begin('clicking back button should keep side bar', function(test) {
  casper.options.viewportSize = {top: 0, left: 0, width: 1280, height: 720};

  casper.start(BASE + '/logmein?as=prabbit')
 .thenOpen(BASE, function() {
    this.click('.lpanel.check-in');
  })
  .then(function() {
    casper.waitForSelector('#checked-out-items');
  })
  .thenOpen('http://www.example.com')
  .then(function() {
    casper.back();
  })
  .then(function(){
    casper.capture(SHOTS + 'back-button-clicked.png');
    test.assertExists('#left_panel');
  })
  .then(function(){casper.clear(); test.done()})
  .run();
});
