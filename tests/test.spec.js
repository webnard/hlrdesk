/**
 * See http://jasmine.github.io/2.0/introduction.html for documentation.
 */

var expect     = require('expect.js'),
    auth       = require('auth');

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
