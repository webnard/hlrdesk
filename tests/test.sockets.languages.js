'use strict';

var chai = require('chai'),
    expect = chai.expect,
    client = require('./lib/socket-client.js'),
    app = require('../core/app');

describe('socket: lang.update', function() {
  beforeEach(require('./resetdb'));

  it('should give an error (alert) if the user is not an admin', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'student');
    socket.on('alert', function(data) {
      expect(data).to.equal('Must be an admin to update languages');
      done();
      socket.disconnect();
    });
    var data = {
      oldCode: 'eng',
      newCode: 'yyy',
      newName: 'English 2.0',
      token: socket.__token
    }
    socket.emit('lang.update', data);
  });

  it('should respond with lang.updateSuccess on success', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('lang.updateSuccess', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      oldCode: 'eng',
      newCode: 'yyy',
      newName: 'English 2.0',
      token: socket.__token
    }
    socket.emit('lang.update', data);
  });

  it('should not emit "alert" on success', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    var timeout = null;
    socket.on('lang.updateSuccess', function(data) {
      timeout = setTimeout(function() {
        done();
        socket.disconnect();
      },500);
    });
    socket.on('alert', function() {
      socket.disconnect();
      clearTimeout(timeout);
      throw new Error("Alert emitted!");
      done();
    });
    var data = {
      oldCode: 'eng',
      newCode: 'yyy',
      newName: 'English 2.0',
      token: socket.__token
    }
    socket.emit('lang.update', data);
  });

  it('should respond with alert when updating a nonexistant code', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('alert', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      oldCode: 'yyy', // doesn't exist
      newCode: 'yyx',
      newName: 'English 2.0',
      token: socket.__token
    }
    socket.emit('lang.update', data);
  });

});

describe('socket: lang.remove', function() {
  beforeEach(require('./resetdb'));

  it('should emit an alert if the user is not an admin', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'student');
    socket.on('alert', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      code: 'eng',
      token: socket.__token
    }
    socket.emit('lang.remove', data);
  });

  it('should emit an alert if the code does not exist', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('alert', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      code: 'yyy',
      token: socket.__token
    }
    socket.emit('lang.remove', data);
  });

  it('should emit lang.itemRemoved on success', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('lang.itemRemoved', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      code: 'dan',
      token: socket.__token
    }
    socket.emit('lang.remove', data);
  });
});

describe('socket: lang.create', function() {
  it('should emit an alert if the user is not an admin', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'student');
    socket.on('alert', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      code: 'yyy',
      name: 'Parseltongue',
      token: socket.__token
    }
    socket.emit('lang.create', data);
  });
  it('should emit an alert if the language exists', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    socket.on('alert', function(data) {
      done();
      socket.disconnect();
    });
    var data = {
      code: 'eng',
      name: 'Parseltongue',
      token: socket.__token
    }
    socket.emit('lang.create', data);
  });
  it('should emit lang.itemAdded on success', function*(done) {
    var server = app.listen(process.env.PORT);
    var socket = yield client(server, 'prabbit');
    var data = {
      code: 'yyy',
      name: 'Parseltongue',
      token: socket.__token
    }
    socket.on('lang.itemAdded', function(resp) {
      expect(resp.code).to.equal(data.code);
      expect(resp.name).to.equal(data.name);
      done();
      socket.disconnect();
    });
    socket.emit('lang.create', data);
  });
});
