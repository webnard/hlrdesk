var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('language', function() {
  beforeEach(require('./resetdb'));
  var language  = require ('../core/app_modules/language');

  describe('.list', function() {
    it('should return an iterable list of items', function*() {
      var languages = yield language.list;
      expect(languages.length).to.be.a('number');
    });
    it('should contain a code and a name', function*() {
      var languages = yield language.list;
      var first = languages[0];
      expect(first).to.contain.keys(['code','name']);
    });
  });
  describe('#remove(code)', function() {
    it('should return true on success', function*() {
      var response = yield language.remove('eng');
      expect(response).to.be.true;
    });
    it('should be rejected if the code does not exist', function*() {
      var promise = language.remove('yyy');
      expect(promise).to.eventually.be.rejected;
    });
    it('should reduce the length of language.list', function*() {
      var l1 = yield language.list;
      yield language.remove('eng');
      var l2 = yield language.list;
      expect(l1).to.have.length.above(l2.length);
    });
  });
  describe('#create(code, language)', function() {
    it('should be rejected if the code already exists', function*() {
      var promise = language.create('eng', 'Denny\'s Moons Over My Hammy®');
      expect(promise).to.eventually.be.rejected;
    });
    it('should increase the length of list', function*() {
      var l1 = yield language.list;
      yield language.create('yyy', 'Boghog');
      var l2 = yield language.list;
      expect(l1).to.have.length.below(l2.length);
    });
  });
  describe('#update(code, new_code, new_language', function() {
    it('should be rejected if the current code does not exist', function*() {
      var promise = language.update('yyy', 'yyy', 'Zug-Zug');
      expect(promise).to.eventually.be.rejected;
    });
    it('should be rejected if the new code already exists', function*() {
      var promise = language.update('eng', 'fra', 'Franglish');
      expect(promise).to.eventually.be.rejected;
    });
    it('should resolve true on success', function*() {
      var result = yield language.update('eng', 'eng', 'Cool English.');
      expect(result).to.be.true;
    });
  });
});
