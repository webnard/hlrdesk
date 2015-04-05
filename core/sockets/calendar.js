var cal = require('../app_modules/cal');

module.exports = function messages(socket, app) {
  socket.on('calendar event', function(event) {
    cal.addCalendarEvent(this.user, event).then(function() {
      app.io.emit("calendar event", event);
    });
  });

  socket.on('delete calendar event', function(event) {
    cal.deleteCalendarEvent(this.user, event).then(function() {
      app.io.emit("delete calendar event", event);
    });
  });
};
