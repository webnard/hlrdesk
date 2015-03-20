var db = require('../app_modules/db');

module.exports = function messages(socket, app) {

  socket.on('write message', function(msg){
    var client = db();
    client.query("INSERT INTO messages(title, username, message_body) VALUES ($1, $2, $3);", [msg.title, 'netId' , msg.body]);
    app.io.emit('write message', msg);
  });

  socket.on('delete message', function(message_number){
    var client = db();
    client.query("DELETE FROM messages WHERE message_id = $1;", [message_number]);
    app.io.emit('delete message', message_number);
  });

  socket.on('write task', function(task){
    var client = db();
    client.transaction(function*(t) {
      var query = "INSERT INTO tasks(task, username, priority) VALUES ($1, $2, -1) RETURNING task_id";
      var result = yield t.queryOne(query, [task.text, 'netId']);
      task.task_id = result.task_id;
      app.io.emit('write task', task);
    }).catch(console.error);
  });

  socket.on('delete task', function(t_number){
    var client = db();
    client.query("DELETE FROM tasks WHERE task = $1;", [t_number.text]);
    app.io.emit('delete task', t_number);
  });

  socket.on('reorder tasks', function(newTaskOrder){
    var client = db();
    newTaskOrder.forEach(function (arrayVal, arrayLocation)
    {
      client.query("update tasks set priority = $1 where task_id = $2", [arrayLocation,arrayVal]);
    })
    app.io.emit('reorder tasks', newTaskOrder);
  });

};
