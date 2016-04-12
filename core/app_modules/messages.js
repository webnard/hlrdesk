var db = require('./db')
var co = require('co');
var auth = require('./auth');
var assert = require('assert');
module.exports = {};

module.exports.addMessage = co.wrap(function*(usr, title, body){
  var client = db();
  yield client.query("INSERT INTO messages(title, username, message_body) VALUES ($1, $2, $3);", [title, usr , body]);
});

module.exports.deleteMessage = co.wrap(function*(delMessage){
  var client = db();
  yield client.query("DELETE FROM messages WHERE message_id = $1;", [delMessage.message_number]);
});

module.exports.addTask = co.wrap(function*(usr, task){
  var client = db();
  yield client.query("INSERT INTO tasks(task, username, priority) VALUES ($1, $2, -1);", [task,usr]);
});

module.exports.deleteTask = co.wrap(function*(t_number){
  var client = db();
  yield client.query("DELETE FROM tasks WHERE task = $1;", [t_number.text]);
});

module.exports.getTable = co.wrap(function*(table){//Try this out for getting a whole table
  var client = db();
  var q = "SELECT * FROM" + table;
  yield client.query(q);
});

module.exports.getMessages = co.wrap(function*(){
  var client = db();
  return yield client.query("SELECT * FROM messages");
});

module.exports.getTasks = co.wrap(function*(){
  var client = db();
  return yield client.query("SELECT * FROM tasks");
});

module.exports.getItemFromTableWhere = co.wrap(function*(table,row, value){
  var client = db();
  var q = "SELECT * FROM "+ table +" WHERE " + row + " = " + value;
  return yield client.query(q);;
});

module.exports.updateTaskOrder = co.wrap(function*(newTaskOrder){
  var client = db();
  newTaskOrder.order.forEach(function (arrayVal, arrayLocation)
  {
    client.query("UPDATE tasks SET priority = $1 WHERE task_id = $2", [arrayLocation,arrayVal]);
  })
});
