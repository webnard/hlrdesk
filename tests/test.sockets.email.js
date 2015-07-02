'use strict';

var chai = require('chai'),
    expect = chai.expect,
    client = require('./lib/socket-client.js'),
    MockSMTPServer = require('./lib/mock-smtp').MockSMTPServer,
    app = require('../core/app');

describe('socket: email.overdue', function() {

  it('should respond with alert when net id does not have an email', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('alert', function() {
      done();
    });

    socket.emit('email.overdue', {items: [], netid: 'toolongtobearealnetid'});
  });

});

describe('socket: email.reminder', function() {

  it('should respond with alert when net id does not have an email', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('alert', function() {
      done();
    });
    socket.emit('email.reminder', {items: [], netid: 'toolongtobearealnetid'});
  });

});
