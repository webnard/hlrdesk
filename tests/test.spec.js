/**
 * See http://mochajs.org/ for documentation.
 */
var expect     = require('expect.js'),
    auth       = require('../core/app_modules/auth'),
    inventory  = require ('../core/app_modules/inventory');

var MOCK_USERNAME = 'prabbit',
    MOCK_PASSWORD = 'prabbitprabbit1';

describe('auth', function() {

  describe('#has_cas_access()', function() {
    it('should be false on a non-BYU domain', function() {
      expect(auth.has_cas_access('localhost', 443)).to.be(false);
    });

    it('should be false on a non-443 port', function() {
      expect(auth.has_cas_access('hlrdesk.byu.edu', 80)).to.be(false);
    });

    it('should be true on a byu domain on port 443', function() {
      expect(auth.has_cas_access('hlrdesk.byu.edu', 443)).to.be(true);
    });
  });

  describe('#cas_login()', function() {
    // do something
  });

});

describe('inventory', function() {
  describe('#checked_out', function() {
    it('should return an array', function* () {
      var vals = yield inventory.checked_out;
      expect(vals).to.be.an(Array);
    });
    it('should return expected properties', function* () {
      var items = yield inventory.checked_out;
      var item = items[0];
      var keys = 'call_number overdue name owner due attendant volume copy extensions'.split(' ');
      expect(item).to.have.keys(keys);
    });
  });
});
