var db = require('../app_modules/db');
var language = require('../app_modules/language');
var auth = require('../app_modules/auth');

module.exports = function(socket, app) {
  socket.on('lang.update', function(event) {
    var that = this;

    auth.isAdmin(that.user).then(function(isAdmin) {
      if(!isAdmin) {
        console.error(that.user + ' attempted to update a language but did not have permissions');
        that.emit('alert', 'Must be an admin to update languages');
        return;
      }
      language.update(event.oldCode, event.newCode, event.newName)
      .then(function() {
        app.io.emit('lang.updateSuccess', event);
      })
      .catch(function(e) {
        console.error(e);
        console.error(e.stack);
        that.emit('alert', 'Error updating language');
      });
    });
  }); // end lang.update

  socket.on('lang.remove', function(event) {
    var that = this;

    auth.isAdmin(that.user).then(function(isAdmin) {
      if(!isAdmin) {
        console.error(that.user + ' attempted to delete language ' + event.code);
        that.emit('alert', 'Must be an admin to delete languages');
        return;
      }
      language.remove(event.code).then(function() {
        app.io.emit('lang.itemRemoved', event.code);
      }).catch(function(error){
        console.error(error);
        that.emit('alert', 'Could not delete code ' + event.code + '. Does it exist?');
      });
    });

  });
};