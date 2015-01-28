var socket = io();
//Lets you sort the list
$(function() {
  $("#task_sort" ).sortable({
    placeholder: "on_drag"
  });
  $("#task_sort" ).disableSelection();
});
//Removes from task list by dragging out
$(function(){
  var removeIntent = false;
  $('#task_sort').sortable({
    over: function () {
      removeIntent = false;
    },
    out: function () {
      removeIntent = true;
    },
    beforeStop: function (event, ui){
      if(removeIntent == true){
        var t_id = ui.item.attr("id");
        ui.item.remove();
        delTask(t_id);
      }
    }
  });
});
//removeDraft
function removeDraft(){
  var del = confirm("Do you really really want to delete this draft?");
    if (del == true){document.getElementById("add_message").innerHTML = '';}
}
//newMsg
function newMsg(){
  var msg_form = "<div  class='message'><img class='message_image' src='http://www.placecage.com/gif/100/100' alt='New Message' width='100' height='100'>"
    +"<button class='exit' onclick='removeDraft()'>X</button>"
    +"<form id='m_form'action=''>"
    +"<input id='m_title' autocomplete='off' placeholder='Title' required></input><br>"
    +"<input id='m_body' autocomplete='off' placeholder='Message' required></input><br>"
    +"<button id='add_new'>Submit</button><br><br>"
    +"</form></div>";
  document.getElementById("add_message").innerHTML = msg_form;
  $('#m_form').submit(function(){
        socket.emit('write message', $('#m_title').val(), $('#m_body').val());
        $('#m_title').val('');
        $('#m_body').val('');
        $('.message').append($("<div class='message'></div>").text(title, msg));//appends for user
        document.getElementById("add_message").innerHTML = '';
        return false;
      });
};
socket.on('write message', function(title, msg){
  $('#all_m').append($("<div class='message'></div>").text(title, msg));
});
//Delete Message
socket.on('delete message', function(message_number){
  var del = document.getElementById("message_"+message_number);
  del.parentNode.removeChild(del);
});
function delMsg(message_number){
  var del_m = confirm("Do you really really want to delete this message?");
  if (del_m == true){
    socket.emit('delete message', message_number);
  };
}
//newTask
socket.on('write task', function(task){
  $('#task_sort').append($("<div class='projects'></div>").text(task));
});
function newTask() {
  var task_form = "<div><form id='t_form' action=''><input id='new_task' autocomplete='off' placeholder='New Task' required></input>"
    +"<button id='add_new'>Submit</button></form></div>";
  document.getElementById("add_task").innerHTML = task_form;
  $('#t_form').submit(function(){
        socket.emit('write task', $('#new_task').val());
        document.getElementById("add_task").innerHTML = '';
        $('#new_task').val('');
        return false;
      });
};
//Delete Task
socket.on('delete task', function(t_number){
  var del = document.getElementById(t_number);
  del.parentNode.removeChild(del);
});
function delTask(t_number){
  var del_t = confirm("Do you really really want to delete this task?");
  if (del_t == true){
    socket.emit('delete task', t_number);
  };
}
