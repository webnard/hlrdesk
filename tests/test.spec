/**
 * See http://mochajs.org/ for documentation.
 * Do not load any modules prior to loading and patching the configuratino.
 */
var config = require('../core/config1');

/**
 * Patch config for testing purposes as follows, and then modules that require
 * the configuration file will get the updated values.
 *
 * Example: config.localhost = 'thing';
 */

// TODO: agree on naming of this property
config.cas_url = 'https://cas.byu.edu/cas/login';

var assert     = require('assert'),
    auth       = require('../core/app_modules/auth'),
    cas_helper = require('./helpers/cas');

var MOCK_USERNAME = 'prabbit',
    MOCK_PASSWORD = 'prabbitprabbit1';

describe('auth', function() {
  describe('#cas_login()', function() {
    it('should validate a correct CAS ticket', function(done) {
      cas_helper.getTicket(MOCK_USERNAME, MOCK_PASSWORD).then(function(ticket){
        console.log(ticket);
        assert(false);
        done();
      });
    });
  });
});
