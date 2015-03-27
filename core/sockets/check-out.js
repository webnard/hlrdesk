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
      if(!reply) {
        console.error('User is not authenticated; cannot search in the database.');
        return;
      }
      var username = reply.toString('utf8');
      inventory.search(event.text, username).then(function(results) {
        mysocket.emit('inv.search.results', results);
      }).catch(function(e) {
        console.error(e);
      });
    });
  });
};
