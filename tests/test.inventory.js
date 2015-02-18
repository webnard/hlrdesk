var expect = require('expect.js');

describe('inventory', function() {
  beforeEach(require('./resetdb'));
  var inventory  = require ('../core/app_modules/inventory');

  describe('#exists(call)', function() {
    it('should return true if item exists', function* () {
      expect(yield inventory.exists('HELLO')).to.be(true);
    });
    it("should return false if item doesn't exists", function* () {
      expect(yield inventory.exists('NOEXIST')).to.be(false);
    });
  });

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
  describe('#check_in(call, patron, attendant)', function() {
    it('should return true if the call number and patron are correct', function* () {
      var call = 'HELLO';
      var patron = 'milo';
      var result = yield inventory.check_in(call, patron, 'tock');
      expect(result).to.be(true);
    });
    it('should return true if a different employee checks the item in', function* () {
      var call = 'HELLO';
      var patron = 'milo';
      expect(yield inventory.check_in(call, patron, 'lecanii')).to.be(true);
    });
    it('should remove the item from the checked_out list', function* () {
      var items = yield inventory.checked_out;
      var length = items.length;
      var i = items[0];
      yield inventory.check_in(i.call_number, i.owner, 'lecanii');
      var new_items = yield inventory.checked_out;
      expect( new_items.length ).to.equal(length-1);
      expect(new_items[0]).to.not.equal(i);
    });
    it('should allow someone to check-in one of duplicate items', function* () {
      var items = yield inventory.checked_out;
      var length = items.length;
      var call = 'DE305D5475B4431BADB2EB6B9E546013';
      var nid = 'thoreau';
      yield inventory.check_in(call, nid, 'lecanii');
      expect( (yield inventory.checked_out).length ).to.equal(length-1);
    });
    it('should allow someone to check-in multiple of duplicate items', function* () {
      var items = yield inventory.checked_out;
      var length = items.length;

      for(var i = 1; i<=6; i++) {
        var call = 'DE305D5475B4431BADB2EB6B9E546013';
        var nid = 'thoreau';
        yield inventory.check_in(call, nid, 'lecanii');
        var new_length = (yield inventory.checked_out).length;
        expect(new_length).to.equal(length-1);
        length = new_length;
      }
    });
    it('should throw an InvalidItemError if item does not exist', function* (done) {
      var call = 'I-DO-NOT-EXIST'; var patron = 'milo';
      try {
        yield inventory.check_in(call, 'milo', 'tock');
      } catch(e) {
        expect(e).to.be.an(inventory.InvalidItemError);
        done();
      };
    });
    it('should throw a NotCheckedOutError if item is not checked out', function* (done) {
      var call = 'I-AM-NOT-CHECKED-OUT';
      var patron = 'milo';
      try {
        yield inventory.check_in(call, 'milo', 'tock');
      } catch(e) {
        expect(e).to.be.an(inventory.NotCheckedOutError);
        done();
      };
    });
    it('should throw a NotCheckedOutError if patron does not exist', function* (done) {
      var call = 'HELLO';
      var patron = 'noexist';
      try {
        yield inventory.check_in(call, patron, 'tock');
      } catch(e) {
        expect(e).to.be.an(inventory.NotCheckedOutError);
        done();
      };
    });
    it('should throw a NotCheckedOutError if the item is checked out, but not by the given patron', function* (done) {
      var call = 'HELLO';
      var patron = 'thoreau';
      try {
        yield inventory.check_in(call, patron, 'tock');
      } catch(e) {
        expect(e).to.be.an(inventory.NotCheckedOutError);
        done();
      };
    });
  });
});
