/*!
 * koa.io - test/supports/client.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var ioc     = require('socket.io-client'),
    request = require('supertest');

// creates a socket.io client for the given server
module.exports = function client(server, user) {
  return new Promise(function(success, reject) {
    request(server)
    .get('/logmein?as='+user)
    .expect(200, function() {
      var addr = server.address && server.address();
      if (!addr) addr = server.listen().address();
      var cookie = encodeURIComponent(this.res.headers['set-cookie'].join(';'));
      var url = 'ws://0.0.0.0:' + addr.port + '?_cookie=' + cookie;
      success(ioc(url, {'forceNew':true }));
    });
  });
};
