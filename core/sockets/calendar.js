var cal = require('../app_modules/cal');

module.exports = function(socket, app) {

  socket.on('calendar event', function(event) {
    _this = this;
    cal.addCalendarEvent(this.user, event, event.user).then(function(events) {
      _this.emit("calendar event", events, event.submittedBy);
    });
  });

  socket.on('delete calendar event', function(event) {
    _this = this;
    cal.deleteCalendarEvent(this.user, event).then(function(events) {
      _this.emit("calendar event", events, event.submittedBy);
    });
  });
};
