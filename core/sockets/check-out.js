var db = require('../app_modules/db');
var redis = require("../app_modules/redis");
var inventory = require('../app_modules/inventory');
var cookie = require('cookie');

module.exports = function(socket, app) {
  socket.on('inv.search', function(event) {
    var mysocket = app.io.sockets.connected[this.id];
    var id = this.id;
    var redisClient = redis();
    redisClient.smembers(cookie.parse(event._cookie).token, function(err, reply){
      var username = reply.toString('utf8');
      console.log(username);
      inventory.search(event.text, username).then(function(results) {
        mysocket.send('inv.search.results', results);
      });
    });
  });
};
