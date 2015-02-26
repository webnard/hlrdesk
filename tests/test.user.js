var expect  = require('expect.js'),
    user    = require('../core/app_modules/user');

describe('user', function() {
  describe('#update(username, properties)', function() {
    it('should not allow me to update the username', function* (done) {
      try {
        user.update('njuster', {netid: 'somethingnew'});
      }catch(e) {
        done();
      }
    });
    it('should return true on success', function* () {
      var data =  {phone: '8015554567', email: 'ham@example.com'}
      var result = yield user.update('njuster', data);
      expect(result).to.be(true);
    });
    it('should throw an error for an invalid email', function* (done) {
      try {
        var data = {email: 'notanemail'}
        yield user.update('njuster', data);
      }catch(e) {
        done();
      }
    });
  });
});
