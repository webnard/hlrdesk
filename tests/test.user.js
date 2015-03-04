var chai    = require('chai'),
    expect  = chai.expect,
    user    = require('../core/app_modules/user');

describe('user', function() {
  describe('#update(username, properties)', function() {
    it('should not allow me to update the username', function* () {
      return expect(user.update('njuster', {netid: 'somethingnew'})).to.eventually.be.rejected;
    });
    it('should return true on success', function* () {
      var data =  {phone: '8015554567', email: 'ham@example.com'}
      var result = yield user.update('njuster', data);
      expect(result).to.be.true;
    });
    it('should throw an error for an invalid email', function* (done) {
      var data = {email: 'notanemail'}
      return expect(user.update('njuster', data)).to.eventually.be.rejected;
    });
  });
});
