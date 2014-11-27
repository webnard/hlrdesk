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
config.localhost = 'http://localhost';
config.port = 8080;

var expect     = require('expect.js'),
    auth       = require('../core/app_modules/auth');

var MOCK_USERNAME = 'prabbit',
    MOCK_PASSWORD = 'prabbitprabbit1',
    SERVICE = config.localhost + ':' + config.port + '/signin';

describe('auth', function() {

  describe('#cas_login()', function() {
    // do something
  });

});
