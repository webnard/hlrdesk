var expect = require('expect.js');

describe('inventory', function() {
  beforeEach(require('./resetdb'));
  var inventory  = require ('../core/app_modules/inventory');

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
