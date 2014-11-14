/**
 * See http://jasmine.github.io/2.0/introduction.html for documentation.
 * Do not load any modules prior to loading and patching the configuratino.
 */
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

var assert     = require('assert'),
    auth       = require('../core/app_modules/auth'),
    cas_helper = require('./helpers/cas');

var MOCK_USERNAME = 'prabbit',
    MOCK_PASSWORD = 'prabbitprabbit1';

describe('auth', function() {
  describe('#cas_login()', function() {
    it('should validate a correct CAS ticket', function(done) {
      cas_helper.getTicket(MOCK_USERNAME, MOCK_PASSWORD).then(function(ticket){
        console.log(ticket); // TODO
        expect(false).toEqual(true);
        done();
      });
    });
  });
});
