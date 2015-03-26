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
    socket.emit('inv.search', {'text': 'HELLO'});
  });

  it('should respond with an array of data', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('inv.search.results', function(results) {
      expect(results).to.be.an.Array;
      done();
    });
    socket.emit('inv.search', {'text': 'HELLO'});
  });

});
