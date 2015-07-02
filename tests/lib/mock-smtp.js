var SMTPServer = require('smtp-server').SMTPServer;

module.exports = {
  MockSMTPServer: function() {
    var server = new SMTPServer({
      logger: false,
      onAuth: function(auth, session, callback) {
        callback(null, {user: 123});
      },
      closeTimeout: 0,
      disabledCommands: ['STARTTLS']
    });

    var promise = new Promise(function(resolve, reject) {
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

    return {
      server: server,
      data: promise
    }

  }
};
