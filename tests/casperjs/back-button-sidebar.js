const PORT = require('system').env.PORT;
const BASE = 'http://127.0.0.1:' + PORT;
const SHOTS = 'tests/screenshots/';

casper.test.begin('clicking back button should keep side bar', function(test) {
  casper.options.viewportSize = {top: 0, left: 0, width: 1280, height: 720};

  casper.start(BASE + '/logmein?as=prabbit');
  casper.thenOpen(BASE, function() {
    this.click('.lpanel.check-in');
  })
  casper.waitForSelector('#checked-out-items');
  casper.thenOpen('http://www.example.com')
  casper.back();
  casper.then(function(){
    casper.capture(SHOTS + 'back-button-clicked.png');
    test.assertExists('#left_panel');
  });
  casper.then(function(){casper.clear(); test.done()})
  casper.run();
});
