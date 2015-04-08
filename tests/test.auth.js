var chai = require('chai'),
    request = require('supertest'),
    expect = chai.expect;
chai.use(require('chai-as-promised'));

describe('auth', function() {
  var auth = require('../core/app_modules/auth');

  describe('#has_cas_access()', function() {
    it('should be false on a non-BYU domain', function() {
      expect(auth.has_cas_access('localhost', 443)).to.be.false;
    });

    it('should be false on a non-443 port', function() {
      expect(auth.has_cas_access('hlrdesk.byu.edu', 80)).to.be.false;
    });

    it('should be true on a byu domain on port 443', function() {
      expect(auth.has_cas_access('hlrdesk.byu.edu', 443)).to.be.true;
    });
  });

  describe('#getUser(token)', function() {
    it('should return false with a made-up token', function*() {
      var username = yield auth.getUser("ay, ay, ay, ay / canta y no llores");
      expect(username).to.be.false;
    });
    it('should return false when given an empty string', function*() {
      var username = yield auth.getUser("");
      expect(username).to.be.false;
    });
    it('should return false when given undefined', function*() {
      var username = yield auth.getUser(undefined);
      expect(username).to.be.false;
    });
    it('should return false when given null', function*() {
      var username = yield auth.getUser(null);
      expect(username).to.be.false;
    });
  });

});

describe('browser login', function(done) {
  it('should redirect me to my desired location after logging in', function() {
    var agent = request(require('../core/app'));
    var url = '/calendar';
    agent
      .get(url)
      .end(function(err, res) {
        expect(res.headers).to.have.any.keys('set-cookie');
        agent
          .get('/logmein?as=prabbit')
          .end(function() {
            agent
              .get('/')
              .expect(302)
              .expect('Location', url, done);
          });
      });
  });

});
