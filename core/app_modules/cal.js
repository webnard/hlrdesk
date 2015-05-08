var db = require('./db')
var co = require('co');
var auth = require('./auth');
var assert = require('assert');
var email = require('./email');
module.exports = {};

get_user_info = co.wrap(function*(netid){
  var client = db();
  var is_user = yield client.query("SELECT * FROM users WHERE netid = $1", [netid]);
  return yield Promise.resolve(is_user.rows[0]);
});

module.exports.addCalendarEvent = co.wrap(function*(username, event, user){
  var client = db();
  var a = yield auth.isAdmin(username);
  if(!a) {
    assert(username === user);
  }

  var isOverlap = false;
  var allCalendarEvents = yield client.query("SELECT * FROM calendar;");
  allCalendarEvents = allCalendarEvents.rows;
  for (var i = 0; i < allCalendarEvents.length; i++) {
    if ((event.time >= allCalendarEvents[i].time && event.time <= allCalendarEvents[i].time + allCalendarEvents[i].duration) && (event.time+event.duration >= allCalendarEvents[i].time && event.time+event.duration <= allCalendarEvents[i].time+allCalendarEvents[i].duration)) {
      isOverlap = true;
    }
  }
  if (!isOverlap) {
    yield client.nonQuery('INSERT INTO calendar("user", "time", room, duration, title)VALUES ($1, $2, $3, $4, $5);', [user, event.time, event.room, event.duration, event.title]);
    var user_info = yield get_user_info(user);
    try {
      email.roomConfirmation(user_info, event.time, event.room)
    }
    catch(err){
      console.log(err)
    }
    return yield Promise.resolve(true);
  } else {
    return yield Promise.reject(new Error("Overlap"));
  }
});

module.exports.deleteCalendarEvent = co.wrap(function*(username, event){
  var client = db();
  var a = yield auth.isAdmin(username);
  if(event.user == username || a) {
    var deletedRows = yield client.nonQuery('DELETE FROM calendar WHERE room = $1 AND "time" = $2 AND "user" = $3;', [event.room, event.time, username]);
    if (deletedRows) {
      return yield Promise.resolve(true);
    }
  }

  return yield Promise.reject(new Error("Nice try."));
});

