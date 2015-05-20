var inventory = require('../app_modules/inventory.js');

module.exports = function(socket, app) {
  socket.on('checkin event', function(event) {
    inventory.check_in(event.call, event.patron, this.user).then(function() {
      app.io.emit("checkin event", event);
    });
  });

  socket.on('extend', function(event) {
    var _this = this;
    inventory.change_due(event.call, event.copy, event.due, this.user).then(function() {
      _this.emit("extend success", event);
    }).catch(function() {
      _this.emit("extend error", event);
    });
  });

};
