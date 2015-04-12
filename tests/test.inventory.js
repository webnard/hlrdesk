var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('inventory', function() {
  beforeEach(require('./resetdb'));
  var inventory  = require ('../core/app_modules/inventory');

  describe('#search(value, user, params)', function () {
    it('should return an array when items are found', function* () {
      var user = 'tock';
      expect(yield inventory.search('HELLO', user)).to.be.an.instanceof(Array);
    });
    it('should return an empty array when no items are found', function* () {
      var user = 'tock';
      var result = yield inventory.search('I-DO-NOT-EXIST', user);
      expect(result).to.be.an.instanceof(Array);
      expect(result.length).to.equal(0);
    });
    it('performs case-insensitive lookup in call number and title', function* () {
      var user = 'tock';
      var result = yield inventory.search('borges', user);
      expect(result.length).to.equal(2);
    });
    it('returns an item with appropriate and accurate fields', function* () {
      var user = 'tock';
      var item = (yield inventory.search('ZAMB0N123', user))[0];
      // TODO: deal with volumes somehow
      expect(item).to.contain.keys(['call_number', 'quantity', 'title']);
      expect(item.call_number).to.equal('ZAMB0N123');
      expect(item.quantity).to.equal(5);
      expect(item.copies_available.length).to.equal(4);
      expect(item.copies_available).to.deep.equal([1,3,4,5]);
      expect(item.title).to.equal('Accelerate');
    });
    it('should throw an error when non-admins search the database', function* () {
      var user = 'notadm';
      var item = inventory.search('HELLO', user);
      expect(item).to.eventually.be.rejected;
    });
    it('should exclude given call numbers with {exclude: [call1, call2, ...]}', function* () {
      var user = 'tock';
      var call = 'I-AM-NOT-CHECKED-OUT';
      var exclusion = [call];
      var params  = {exclude: exclusion};
      var items_no_exclude = yield inventory.search(call, user);
      var items = yield inventory.search(call, user, params);
      expect(items_no_exclude).to.have.length.above(items.length);
    });
  });

  describe('#exists(call)', function() {
    it('should return true if item exists', function* () {
      expect(yield inventory.exists('HELLO')).to.be.true;
    });
    it("should return false if item doesn't exists", function* () {
      expect(yield inventory.exists('NOEXIST')).to.be.false;
    });
  });

  describe('#checked_out', function() {
    it('should return an array', function* () {
      var vals = yield inventory.checked_out;
      expect(vals).to.be.an.instanceof(Array);
    });
    it('should return expected properties', function* () {
      var items = yield inventory.checked_out;
      var item = items[0];
      var keys = 'call_number overdue name owner due attendant volume copy extensions'.split(' ');
      expect(item).to.contain.keys(keys);
    });
  });

  describe('#is_checked_out(call, copy)', function() {
    it('should resolve true when checked out', function *() {
      expect(yield inventory.is_checked_out('HELLO',1)).to.be.true;
    });
    it('should resolve false when not checked out', function *() {
      expect(yield inventory.is_checked_out('M347FEST',1)).to.be.false;
    });
  });

  describe('#check_out([{call:..., copy:..., due:...},...], patron, employee)', function() {
    var moment = require('moment');
    const TOMORROW = moment().add(1, 'day').toDate();
    const YESTERDAY = moment().subtract(1, 'day').toDate();

    it('should throw an error if the item does not exist', function* () {
      var call = 'I-DO-NOT-EXIST';
      var patron = 'milo';
      var copy = 1;
      var items = [{call: call, copy: copy, due: TOMORROW}];
      var promise = inventory.check_out(items, patron, 'tock');
      return expect(promise).to.eventually.be.rejected;
    });
    it('should throw an error if the patron does not exist', function* () {
      var call = 'M347FEST';
      var patron = 'I-SHOULD-NOT-EXIST';
      var copy = 1;
      var items = [{call: call, copy: copy, due: TOMORROW}];
      var promise = inventory.check_out(items, patron, 'tock');
      return expect(promise).to.eventually.be.rejected;
    });
    it('should throw an error if the employee is not an admin', function* () {
      var call = 'M347FEST';
      var patron = 'milo';
      var employee = 'notadm';
      var copy = 1;
      var items = [{call: call, copy: copy, due: TOMORROW}];
      var promise = inventory.check_out(items, patron, employee);
      return expect(promise).to.eventually.be.rejected;
    });
    it('should throw an error if the due date is before the current time', function* () {
      var call = 'M347FEST';
      var patron = 'milo';
      var copy = 1;
      var items = [{call: call, copy: copy, due: YESTERDAY}];
      var promise = inventory.check_out(items, patron, 'tock');
      return expect(promise).to.eventually.be.rejected;
    });
    it('should throw an error if the call/copy combo is already checked out', function* () {
      var call = 'HELLO';
      var patron = 'milo';
      var copy = 1;
      var items = [{call: call, copy: copy, due: YESTERDAY}];
      var promise = inventory.check_out(items, patron, 'tock');
      return expect(promise).to.eventually.be.rejected;
    });
    it('should resolve as true', function* () {
      var call = 'M347FEST';
      var patron = 'milo';
      var employee = 'tock';
      var copy = 1;
      var items = [{call: call, copy: copy, due: TOMORROW}];
      var val = yield inventory.check_out(items, patron, employee);
      expect(val).to.be.ok;
    });
    it('should increase the number of checked-out items by one', function* () {
      var call = 'M347FEST';
      var patron = 'milo';
      var employee = 'tock';
      var copy = 1;
      var items = [{call: call, copy: copy, due: TOMORROW}];
      var checked_out_length = (yield inventory.checked_out).length;
      yield inventory.check_out(items, patron, employee);
      var checked_out_length2 = (yield inventory.checked_out).length;
      expect(checked_out_length2).to.equal(checked_out_length + 1);
    });
    it('should allow me to check out multiple items at once', function* () {
      var patron = 'milo';
      var employee = 'tock';
      var items = [
        {
        call: 'M347FEST',
        copy: 1,
        due: TOMORROW
        },{
        call: 'DEADBEEF',
        copy: 2,
        due: TOMORROW
        }
      ];
      var checked_out_length = (yield inventory.checked_out).length;
      yield inventory.check_out(items, patron, employee);
      var checked_out_length2 = (yield inventory.checked_out).length;
      expect(checked_out_length2).to.equal(checked_out_length + items.length);
    });
    it('should fail an entire batch of items if one is wrong', function* () {
      var patron = 'milo';
      var employee = 'tock';
      var items = [
        {
        call: 'M347FEST',
        copy: 1,
        due: TOMORROW
        },{
        call: 'DEADBEEF',
        copy: 2,
        due: YESTERDAY
        }
      ];
      var checked_out_length = (yield inventory.checked_out).length;
      var promise = inventory.check_out(items, patron, employee);
      expect(promise).to.eventually.be.rejected;
      var checked_out_length2 = (yield inventory.checked_out).length;
      expect(checked_out_length2).to.equal(checked_out_length);
    });
    it('should add the checked-out item to the database', function* () {
      // remove everything first of all, because it's easier to parse then
      var client = require('../core/app_modules/db')(),
          call = 'M347FEST',
          patron = 'milo',
          employee = 'tock';

      var copy = 1;
      var items = [{call: call, copy: copy, due: TOMORROW}];

      yield client.query('TRUNCATE checked_out');
      yield inventory.check_out(items, patron, employee);

      var checked_out = (yield inventory.checked_out)[0];

      expect(checked_out.call_number).to.equal(call);
      expect(checked_out.copy).to.equal(copy);
      expect(checked_out.owner).to.equal(patron);
      expect(checked_out.attendant).to.equal(employee);
    });
  });

  describe('#check_in(call, patron, attendant)', function() {
    it('should return true if the call number and patron are correct', function* () {
      var call = 'HELLO';
      var patron = 'milo';
      var result = yield inventory.check_in(call, patron, 'tock');
      expect(result).to.be.true;
    });
    it('should return true if a different employee checks the item in', function* () {
      var call = 'HELLO';
      var patron = 'milo';
      expect(yield inventory.check_in(call, patron, 'lecanii')).to.be.true;
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
    it('should throw an error if item does not exist', function* () {
      var call = 'I-DO-NOT-EXIST';
      var patron = 'milo';
      var promise = inventory.check_in(call, 'milo', 'tock');
      return expect(promise).to.eventually.be.rejected;
    });
    it('should throw an error if item is not checked out', function* () {
      var call = 'I-AM-NOT-CHECKED-OUT';
      var patron = 'milo';
      var promise = inventory.check_in(call, 'milo', 'tock');
      return expect(promise).to.eventually.be.rejected;
    });
    it('should throw an error if patron does not exist', function* () {
      var call = 'HELLO';
      var patron = 'noexist';
      var promise = inventory.check_in(call, patron, 'tock');
      return expect(promise).to.eventually.be.rejected;
    });
    it('should throw an error if the item is checked out, but not by the given patron', function* () {
      var call = 'HELLO';
      var patron = 'thoreau';
      var promise = inventory.check_in(call, patron, 'tock');
      return expect(promise).to.eventually.be.rejected;
    });
    it('should throw an error if the person doing the check-in for the patron is not an employee', function* () {
      var call = 'HELLO';
      var patron = 'psota';
      var employee = 'notadm';
      var promise = inventory.check_in(call, patron, employee);
      return expect(promise).to.eventually.be.rejected;
    });
  });
});
