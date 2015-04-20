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
      var first = [0];
      expect(first).to.contain.keys(['code','name']);
    });
  });
});
