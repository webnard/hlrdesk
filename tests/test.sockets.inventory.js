'use strict';

var chai = require('chai'),
    expect = chai.expect,
    client = require('./lib/socket-client.js'),
    app = require('../core/app');

describe('socket: inv.search', function() {

  it('should respond with an inv.search.results emission', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('inv.search.results', function() {
      done();
    });
    socket.emit('inv.search', {'text': 'HELLO', token: socket.__token});
  });

  it('should respond with an array of data', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('inv.search.results', function(results) {
      expect(results).to.be.an.Array;
      done();
    });
    socket.emit('inv.search', {'text': 'HELLO', token: socket.__token});
  });
});

describe('socket: inv.checkout', function() {
  it('should emit inv.checkout.success on success', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');

    socket.on('inv.checkout.success', function() {
      done();
    });

    var due = new Date();
    due = due.setYear(due.getUTCFullYear()+1);
    var data = {
      items: [{
        'call': 'M347FEST',
        'copy': 1,
        'due': due
      }],
      netid: 'milo',
      email: 'test@example.com',
      phone: '0118 999 881 99 9119 7253',
      token: socket.__token
    };
    socket.emit('inv.checkout', data);
  });
  it('should emit "alert" on error', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');

    socket.on('alert', function() {
      done();
    });

    var due = new Date();
    // due date is earlier than it should be
    due = due.setYear(due.getUTCFullYear()-1);
    var data = {
      items: [{
        'call': 'M347FEST',
        'copy': 1,
        'due': due
      }],
      netid: 'milo',
      email: 'test@example.com',
      phone: '0118 999 881 99 9119 7253',
      token: socket.__token
    };
    socket.emit('inv.checkout', data);
  });
});
