var db = require('../app_modules/db');
var redis = require("../app_modules/redis");
var cookie = require('cookie');

module.exports = function messages(socket, app) {
  socket.on('calendar event', function(event) {
    var cal = require('../app_modules/cal');
    var redisClient = redis();
    redisClient.smembers(cookie.parse(event._cookie).token, function(err, reply){
      var username = reply.toString('utf8');
      cal.addCalendarEvent(username, event, reply).then(function() {
        app.io.emit("calendar event", event);
      });
    });
  });

  socket.on('delete calendar event', function(event) {
    var cal = require('../app_modules/cal');
    var redisClient = redis();
    redisClient.smembers(cookie.parse(event._cookie).token, function(err, reply){
      var username = reply.toString('utf8');
      cal.deleteCalendarEvent(username, event).then(function() {
        app.io.emit("delete calendar event", event);
      });
    });
  });
};
