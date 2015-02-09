var expect     = require('expect.js');

describe('auth', function() {
  var auth = require('../core/app_modules/auth');

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
