var chai = require('chai'),
    expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('user', function() {
  var user = require('../core/app_modules/user');

  describe('#ldapInfo(netID)', function() {
    it('should return expected data', function*() {
      var data = yield user.ldapInfo('prabbit');
      expect(data.prabbit.cn).to.equal('Peter Oliver Rabbit');
    });
    it('should allow multiple netids', function*() {
      var data = yield user.ldapInfo('prabbit', 'paronnax');
      expect(data.prabbit.cn).to.equal('Peter Oliver Rabbit');
      expect(data.paronnax.cn).to.equal('Pierre Aronnax');
    });
  });
  describe('#contactInfo(netID)', function() {
    beforeEach(require('./resetdb'));
    it('should prefer information in the database', function*() {
      var data = yield user.contactInfo('prabbit','paronnax', 'csamuels', 'kw9');

      // in local database
      expect(data.csamuels.telephone).to.equal('801-123-4567', 'Phone number not in local db');
      // on ldap server
      expect(data.csamuels.email).to.equal('cecil_samuelson@byu.edu', 'Email not on ldap server');

      // on ldap server
      expect(data.kw9.telephone).to.equal('801-422-2521', 'Phone number not on ldap server');
      // in local database
      expect(data.kw9.email).to.equal('fake@mailinator.com', 'Email not in local db');
    });
  });
});
