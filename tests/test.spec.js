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

var assert     = require('assert'),
    auth       = require('../core/app_modules/auth'),
    jasmine    = require('jasmine-node'),
    cas_helper = require('./helpers/cas');

var MOCK_USERNAME = 'prabbit',
    MOCK_PASSWORD = 'prabbitprabbit1';

describe('auth', function() {

  describe('#cas_login()', function() {
    
    it('should validate a correct CAS ticket', function(done) {
      var a = cas_helper.getTicket(MOCK_USERNAME, MOCK_PASSWORD, function(ticket){
        auth.cas_login(ticket).then(function(response) {
          expect(response.status).toBe(true, "A valid ticket should have a true status");
          expect(response.username).toBe(MOCK_USERNAME, "CAS should return the same username as whoever logged in");
          done();
        });
      });
    });

    it('should fail on an incorrect ticket', function(done) {
      auth.cas_login("deadbeef").then(function(response) {
        expect(response.status).toBe(false, "Status must be false with a bad ticket");
        expect(response.username).toEqual(null, "No username should be returned with a bad ticket");
        done();
      });
    });

  });

});
