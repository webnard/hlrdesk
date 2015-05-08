var checkin = require('../app_modules/inventory.js');

module.exports = function(socket, app) {
  socket.on('checkin event', function(event) {
    checkin.check_in(event.call, event.patron, this.user).then(function() {
      app.io.emit("checkin event", event);
    });
  });
};
