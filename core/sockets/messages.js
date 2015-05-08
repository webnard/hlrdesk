var auth = require('../app_modules/auth');
var db = require('../app_modules/db');
  
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
  
    socket.on('write message', function(msg){
      var usr = this;
      var errMessage = ' attempted to write a message ' + msg.title + " " + msg.body;
      checkMe(this, errMessage, function success() 
      {
        var client = db();
        client.query("INSERT INTO messages(title, username, message_body) VALUES ($1, $2, $3);", [msg.title, usr.user , msg.body]);
        app.io.emit('write message', msg);
      })
    });

    socket.on('delete message', function(delMessage){    
      var errMessage = ' attempted to delete message number ' + delMessage.message_number
      checkMe(this, errMessage, function success() {
        var client = db();
        client.query("DELETE FROM messages WHERE message_id = $1;", [delMessage.message_number]);
        app.io.emit('delete message', delMessage);
      })
    });

    socket.on('write task', function(task){    
      var usr = this
      var errMessage = ' attempted to write task ' + task.text;
      checkMe(usr, errMessage, function success() {
        var uID = usr.user;
        var client = db();
        client.transaction(function*(t) {
          var query = "INSERT INTO tasks(task, username, priority) VALUES ($1, $2, -1) RETURNING task_id";
          var result = yield t.queryOne(query, [task.text, uID]);
          task.task_id = result.task_id;
          app.io.emit('write task', task);
        }).catch(console.error);
      })
    });

    socket.on('delete task', function(t_number){
      var errMessage = ' attempted to delete task number ' + t_number.text;
      checkMe(this, errMessage, function success() 
      {
        var client = db();
        client.query("DELETE FROM tasks WHERE task = $1;", [t_number.text]);
        app.io.emit('delete task', t_number);
      });
    });

    socket.on('reorder tasks', function(newTaskOrder){
      checkMe(this, ' attempted to reorder the tasks', function success() 
      {
        var client = db();
        newTaskOrder.order.forEach(function (arrayVal, arrayLocation)
        {
          client.query("update tasks set priority = $1 where task_id = $2", [arrayLocation,arrayVal]);
        })
        app.io.emit('reorder tasks', newTaskOrder);
      })
    });
  };
