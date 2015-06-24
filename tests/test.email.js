var chai = require('chai'),
    expect = chai.expect,
    crypto = require('crypto'),
    SMTPServer = require('smtp-server').SMTPServer,
    fs = require('co-fs');

chai.use(require('chai-as-promised'));

describe('email', function() {
  var server, name, item, address, serverPromise, email, items;

  beforeEach(function(done) {
    server = new SMTPServer({
      logger: false,
      onAuth: function(auth, session, callback) {
        callback(null, {user: 123});
      },
      closeTimeout: 0,
      disabledCommands: ['STARTTLS']
    });

    email = require('../core/app_modules/email');
    name = crypto.randomBytes(20).toString('hex');
    item = crypto.randomBytes(20).toString('hex');
    item2 = crypto.randomBytes(20).toString('hex');
    item3 = crypto.randomBytes(20).toString('hex');
    address = process.env.USER + '@' + process.env.HOSTNAME;

    items = [{
      item: item,
      due: new Date(1434735041613),
    },
    {
      item: item2,
      due: new Date(1434735041613),
    },
    {
      item: item3,
      due: new Date(1434735041613),
    }];

    serverPromise = new Promise(function(resolve, reject) {
      server.onData = function(stream, session, callback) {
        var chunks = [];
        var chunkLen = 0;
        stream.on('data', function(data) {
          chunks.push(data)
          chunkLen += data.length;
        });

        stream.on('end', function() {
          var result = Buffer.concat(chunks, chunkLen).toString();
          callback(null);
          server.close(function(){
            resolve(result)
          });
        });
      };

    });

    server.on('error', function(err) {
      console.error("SMTP error", err);
    });

    server.listen(process.env.SMTP_PORT, done);
  });

  describe('reminder(item_title, due, name, email)', function() {
    it('should send an email to the given address', function * () {
      yield email.reminder(items, name, address);

      var data = yield serverPromise;

      expect(data).to.not.be.null;
      expect(data.match(name)).to.not.be.null;
      expect(data.match('June 19th')).to.not.be.null;
      expect(data.match('courtesy reminder')).to.not.be.null;
      expect(data.match(item)).to.not.be.null;
      expect(data.match(item2)).to.not.be.null;
      expect(data.match(item3)).to.not.be.null;
    });
  });

  describe('overdue(item_title, due, name, email)', function () {
    it('should send an email to the given address', function * () {
      yield email.overdue(items, name, address);
      var data = yield serverPromise;

      expect(data).to.not.be.null;
      expect(data.match(name)).to.not.be.null;
      expect(data.match('June 19th')).to.not.be.null;
      expect(data.match('now overdue')).to.not.be.null;
      expect(data.match(item)).to.not.be.null;
      expect(data.match(item2)).to.not.be.null;
      expect(data.match(item3)).to.not.be.null;
    });
  });

});
