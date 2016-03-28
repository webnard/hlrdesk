var auth = require('../app_modules/auth');
var db = require('../app_modules/db');
var msg = require('../app_modules/messages');
  
module.exports = function messages(socket, app) {

  function checkMe(that, errMessage, callback)
  {
    auth.isAdmin(that.user).then(function(isAdmin) 
    {
      if(!isAdmin) 
      {
        console.error(that.user + errMessage);
        that.emit('alertMessage', 'You do not have admin priviledges, if you do, please log in again');
        return false;
      }
      else {callback();}
      }).catch(console.error);
    }
  
    socket.on('write message', function(mesg){
      var usr = this;
      var errMessage = ' attempted to write a message \n' + mesg.title + "\n" + mesg.body;
      checkMe(this, errMessage, function success() 
      {
        msg.addMessage(usr.user, mesg.title, mesg.body);
        app.io.emit('write message', mesg);
      })
    });

    socket.on('delete message', function(delMessage){    
      var errMessage = ' attempted to delete message number ' + delMessage.message_number
      checkMe(this, errMessage, function success() {
        msg.deleteMessage(delMessage);
        app.io.emit('delete message', delMessage);
      })
    });

    socket.on('write task', function(task){    
      var usr = this
      var errMessage = ' attempted to write task ' + task.text;
      checkMe(usr, errMessage, function success() {
        msg.addTask(usr.user, task.text);
        app.io.emit('write task', task);
        
      })
    });

    socket.on('delete task', function(t_number){
      var errMessage = ' attempted to delete task number ' + t_number.text;
      checkMe(this, errMessage, function success() 
      {
        msg.deleteTask(t_number);
        app.io.emit('delete task', t_number);
      });
    });

    socket.on('reorder tasks', function(newTaskOrder){
      checkMe(this, ' attempted to reorder the tasks', function success() 
      {
        msg.updateTaskOrder(newTaskOrder);
        app.io.emit('reorder tasks', newTaskOrder);
      })
    });
    
    socket.on('message read', function(object){
      var that = this;
      checkMe(this, ' tried to read messages', function success() 
      {
        var client = db();
        client.query("UPDATE users SET last_login = current_timestamp WHERE netid = $1", [that.user]);
      })
    });
    
    socket.on('unread message', function(object){
      var that = this;
      checkMe(this, ' tried to read messages', function success() 
      {
        var client = db();
        //TODO: move, send this when page is reloaded to only that user
        client.transaction(function*(t) {
          var query = "SELECT CASE WHEN (SELECT posted FROM messages WHERE username != $1 ORDER BY posted DESC LIMIT 1) > (SELECT last_login FROM users WHERE netid = $1) THEN TRUE ELSE FALSE END return_column";
          var result = yield t.queryOne(query, [that.user]);
          if (result.return_column == true) {
            that.emit('unread message');
          }
        }).catch(console.error);
      })
    });
  };
