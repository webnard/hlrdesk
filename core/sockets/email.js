var email = require('../app_modules/email');
var auth = require('../app_modules/auth');

module.exports = function(socket, app) {

  socket.on('email.overdue', function(event) {
    sendEmail(event, this, email.overdue);
  });

  socket.on('email.reminder', function(event) {
    sendEmail(event, this, email.reminder);
  });

};

function sendEmail(event, socket, fn) {
  auth.isAdmin(socket.user).then(function(result) {
    if(!result) {
      socket.emit('alert', 'Invalid permissions.');
    }
    else
    {
      user.contactDetails(event.netid).then(function(result) {
        if(!result[event.netid].email) {
          var err = (new Date()) + 'Could not find an email for ' + event.netid;
          socket.emit('alert', err);
          console.error(err);
          return;
        }

        fn(event.items, name, email).then(function() {
          socket.emit('email.sent', 'Email sent to ' + event.name);
        }).catch(function(err) {
          socket.emit('alert', 'Error sending an email to ' + event.name);
          console.error(err);
        });

      });
    }
  });
};
