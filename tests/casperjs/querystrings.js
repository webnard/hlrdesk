"use strict";

const PORT = require('system').env.PORT;
const BASE = 'http://127.0.0.1:' + PORT;
const SHOTS = 'tests/screenshots/';

casper.test.begin('query strings should work on pages', function(test) {
  casper.options.viewportSize = {top: 0, left: 0, width: 1280, height: 720};
  
  casper.start(BASE + '/logmein?as=prabbit', function() {
    test.assertHttpStatus(200, "Login as prabbit");
  });
  
  casper.thenOpen(BASE + '/message?ajax=true&dave=matthews');
  casper.wait(250);
  casper.then(function() {
    casper.capture(SHOTS + 'message-page-query-string.png');
    test.assertEvalEquals(function() {
      return window.location.toString();
    }, BASE + '/message?ajax=true&dave=matthews');
  });
  casper.then(function(){casper.clear(); test.done()})
  casper.run();
});
