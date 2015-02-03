/**
 * See http://mochajs.org/ for documentation.
 */
var expect     = require('expect.js'),
    auth       = require('../core/app_modules/auth'),
    inventory  = require ('../core/app_modules/inventory'),
    prom_spawn = require('prom-spawn');

const ENV = process.env;

var MOCK_USERNAME = 'prabbit',
    MOCK_PASSWORD = 'prabbitprabbit1';

function resetDB(callback) {
  // note that ENV.PGDATABASE is set by the .run-tests.sh
  prom_spawn('psql',ENV.TEMPLATE_DB,'-c','DROP DATABASE IF EXISTS ' + ENV.PGDATABASE)()
    .then(prom_spawn('createdb',ENV.PGDATABASE,'-T',ENV.TEMPLATE_DB))
    .then(callback);
}

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
  beforeEach(resetDB);
  describe('#checked_out', function() {
    it('should return an array', function* () {
      console.log("Starting 'should return array' test");
      var vals = yield inventory.checked_out;
      expect(vals).to.be.an(Array);
    });
    it('should return expected properties', function* () {
      console.log("Starting 'should return exp. properties' test");
      var items = yield inventory.checked_out;
      var item = items[0];
      var keys = 'call_number overdue name owner due attendant volume copy extensions'.split(' ');
      expect(item).to.have.keys(keys);
    });
  });
});
