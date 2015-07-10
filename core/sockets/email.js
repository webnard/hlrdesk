var email = require('../app_modules/email');
var auth = require('../app_modules/auth');
var user = require('../app_modules/user');

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
      console.error(socket.user + " attempted to send a reminder email to " + event.netid);
    }
    else
    {
      console.log("Retrieving contact details for " + event.netid);
      user.contactInfo(event.netid).then(function(result) {
        var info = result[event.netid];
        if(!info.email) {
          var err = (new Date()) + 'Could not find an email for ' + event.netid;
          socket.emit('alert', err);
          console.error(err);
          return;
        }
        console.log(socket.user + " is sending an email to " + info.name + " at " + info.email);

        var name = info.name || event.netid;
        fn(event.items, name, info.email).then(function() {
          socket.emit('email.sent', 'Email sent to ' + name);
          console.log("Email sent to " + name + " at " + info.email);
        }).catch(function(err) {
          socket.emit('alert', 'Error sending an email to ' + name);
          console.error(err);
        });

      }).catch(function(err) {
        socket.emit('alert', 'Error sending an email to ' + event.netid);
        console.error(err);
      });
    }
  }).catch(function(err) {
    socket.emit('alert', 'Error sending an email to ' + event.netid);
    console.error(err);
  });;
};
