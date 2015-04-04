var db = require('../app_modules/db');
var inventory = require('../app_modules/inventory');

module.exports = function(socket, app) {
  socket.on('inv.search', function(event) {
    var mysocket = app.io.sockets.connected[this.id];
    var params = {exclude: event.exclude};

    inventory.search(event.text, mysocket.user, params).then(function(results) {
      mysocket.emit('inv.search.results', results);
    }).catch(function(e) {
      console.error(e);
    });

  });
};
