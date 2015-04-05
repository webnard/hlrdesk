var db = require('../app_modules/db');
var inventory = require('../app_modules/inventory');

module.exports = function(socket, app) {
  socket.on('inv.search', function(event) {
    var that = this;
    var params = {exclude: event.exclude};

    inventory.search(event.text, this.user, params).then(function(results) {
      that.emit('inv.search.results', results);
    }).catch(function(e) {
      console.error(e);
    });

  });
};
