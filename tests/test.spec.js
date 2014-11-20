/**
 * See http://jasmine.github.io/2.0/introduction.html for documentation.
 */

// make it so loading config1.js actually loads the template, config.js
// this helps make sure these tests don't Bjork anything on the live server
// (if they are run). We can also easily monkeypatch the template to be
// test-specific
var mockery = require('mockery');

mockery.enable();
mockery.warnOnUnregistered(false);

// TODO: come up with a less terrible way of mocking the configuration. Environment vars?
mockery.registerMock('../../core/config1', require('../core/config'));
mockery.registerMock('../core/config1', require('../core/config'));
mockery.registerMock('../config1', require('../core/config'));
mockery.registerMock('config1', require('../core/config'));

var config = require('../core/config1');

/**
 * Patch config for testing purposes as follows, and then modules that require
 * the configuration file will get the updated values.
 *
 * Example: config.localhost = 'thing';
 */

// TODO: agree on the proper naming of this configuration property
config.cas = {
  host: 'cas.byu.edu',
  path: '/cas/login',
  port: 443
}
config.cas.url = 'https://' + config.cas.host + config.cas.path;
config.localhost = 'http://localhost'

var expect     = require('expect.js'),
    auth       = require('../core/app_modules/auth'),
    cas_helper = require('./helpers/cas');

var MOCK_USERNAME = 'prabbit',
    MOCK_PASSWORD = 'prabbitprabbit1';

describe('auth', function() {

  describe('#cas_login()', function() {
   
    it('should fail on an incorrect ticket', function* () {
      var response = yield auth.cas_login("deadbeef");
      expect(response.status).to.be(false);
      expect(response.username).to.be(null);
    });

    it('should validate a correct CAS ticket', function* () {
      var ticket = yield cas_helper.getTicket(MOCK_USERNAME, MOCK_PASSWORD);
      var response = yield auth.cas_login(ticket);
      expect(response.status).to.be(true);
      expect(response.username).to.be(MOCK_USERNAME);
    });
  });

});
