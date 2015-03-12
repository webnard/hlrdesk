var db = require('./db')
var co = require('co');
var auth = require('./auth');
module.exports = {};

module.exports.addCalendarEvent = co.wrap(function*(username, event){
  var client = db();
  var a = yield auth.isAdmin(username);
  var user = a ? event.user : reply;
  client.query('INSERT INTO calendar("user", "time", room, duration, title)VALUES ($1, $2, $3, $4, $5);', [user, event.time, event.room, event.duration, event.title]);

  return yield Promise.resolve(true);
});

module.exports.deleteCalendarEvent = co.wrap(function*(username, event){
  var client = db();
  var a = yield auth.isAdmin(username);
  if(event.user == username || a) {
    client.query('DELETE FROM calendar WHERE room=$1 AND "time"=$2;', [event.room, event.time]);
    return yield Promise.resolve(true);
  }
  
  return yield Promise.reject(new Error("Nice try."));
});