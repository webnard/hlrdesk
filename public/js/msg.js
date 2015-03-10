var socket = io();
//var newTaskOrder;
//Lets you sort the list
$(function(event, ui) {
  $("#task_sort" ).sortable({
    placeholder: "on_drag"
  });
  $("#task_sort" ).disableSelection();
});
//Removes from task list by dragging out
$(function(){
  var removeIntent = false;
  $('#task_sort').sortable({
    over: function (event, ui) {
    var som = ui.item.attr("id")
    console.log("Task over "+som);
    var variable = document.getElementById(som).innerHTML;
    console.log("VARIABLE + " +variable);
      removeIntent = false;
    },
    out: function (event, ui) {
    console.log("Task out " + ui.item.attr("id"));
    var newTaskOrder = $(this).sortable( "toArray" );
    console.log(newTaskOrder);
    socket.emit('reorder tasks', newTaskOrder);
      removeIntent = true;
    },
    beforeStop: function (event, ui){
      if(removeIntent == true){
        var t_id = ui.item.attr("id");
        var variable = document.getElementById(t_id).innerHTML;
        var del_task = {"t_id":t_id, "text":variable};
        //ask for delete confirmation, use modal window
        //ui.item.remove();
        delTask(del_task);
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
    +"<input id='m_title' autocomplete='off' autofocus placeholder='Title' required></input><br>"
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


function newTask() {
  var task_form = "<div><form id='t_form' action=''><input id='new_task' autocomplete='off' autofocus placeholder='New Task' required></input>"
    +"<button id='add_new'>Submit</button></form></div>";
  document.getElementById("add_task").innerHTML = task_form;
  $('#t_form').submit(function(){
  var write_task = {"text":$('#new_task').val(), "task_id":-1 };
        socket.emit('write task', write_task);
        document.getElementById("add_task").innerHTML = '';
        $('#new_task').val('');
        document.getElementById("task_sort").innerHTML = '';
        
        return true;
      });
};
//newTask
socket.on('write task', function(task){
  console.log("Write Task function "+task);
  updateTasks();
  //$('#task_sort').append($("<div class='projects'></div>").text(task));
});

function updateTasks() {
  console.log("Update Tasks function");
  
}

//Delete Task
socket.on('delete task', function(task){
  console.log("Delet Task .on = " + task.t_id); 
  //var del = $(".projects:contains($task)").filter();
  
  var del = document.getElementById(task.t_id);
  console.log("Del = "+ task.t_id);
  del.parentNode.removeChild(del);    
});

function delTask(del_task){
 console.log("DelTask function");
 console.log(del_task.t_id);
 console.log(del_task.text);
  socket.emit('delete task', del_task);
}

//Reorder Tasks
socket.on('reorder tasks', function(newTaskOrder){
  console.log("Reorder Tasks " + newTaskOrder);
  //updateTasks();
  //$('#task_sort').append($("<div class='projects'></div>").text(task));
});
