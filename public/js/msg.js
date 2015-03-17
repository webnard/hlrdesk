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
      var find = ui.item.attr("id")
      var newTaskOrder = $(this).sortable( "toArray" );
      var variable = document.getElementById(find).innerHTML;
      socket.emit('reorder tasks', newTaskOrder);
      removeIntent = false;
    },
    out: function (event, ui) {
      var newTaskOrder = $(this).sortable( "toArray" );
      socket.emit('reorder tasks', newTaskOrder);
      removeIntent = true;
    },
    beforeStop: function (event, ui){
      if(removeIntent == true){
        var t_id = ui.item.attr("id");
        var variable = document.getElementById(t_id).innerHTML;
        var del_task = {"t_id":t_id, "text":variable};
        //ask for delete confirmation, use modal window
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
    +"<i class='fa fa-times' id='icon_exit' onclick='removeDraft()' ></i>"
    +"<form id='m_form'action=''>"
    +"<input id='m_title' autocomplete='off' autofocus placeholder='Title' required></input><br>"
    +"<input id='m_body' autocomplete='off' placeholder='Message' required></input><br>"
    +"<button class='greenBtn'>Submit</button><br><br>"
    +"</form></div>";
  document.getElementById("add_message").innerHTML = msg_form;
  $('#m_form').submit(function(){
    var msg = { "title":$('#m_title').val(), "body":$('#m_body').val() }
    socket.emit('write message', msg);
    document.getElementById("add_message").innerHTML = '';
    return false;
  });
};
socket.on('write message', function(msg){
  console.log("Title = " + msg.title + " Body = " + msg.body);
  //var new_msg = "<div class='message' id='-1'
  //add all of the properties here + 

  //$('#all_m').append($("<div class='message'></div>").text(msg.title));
  //$('#all_m').append($("<div class='message'>msg.title</div>").text(msg.title, msg.body));
});

//Delete Message
socket.on('delete message', function(message_number){
  var del = document.getElementById("message_"+message_number);
  del.parentNode.removeChild(del);
});

function delMsg(message_number){
  var del_m = confirm("Do you really really want to delete this message?");
  if (del_m == true){socket.emit('delete message', message_number);};
}


function newTask() {
  var task_form = "<div><form id='t_form' action=''><input id='new_task' autocomplete='off' autofocus placeholder='New Task' required></input>"
    +"<button class='greenBtn' id='add_new'>Submit</button></form></div>";
  document.getElementById("add_task").innerHTML = task_form;
  $('#t_form').submit(function(evt){
    evt.preventDefault();
    var write_task = {"text":$('#new_task').val(), "task_id":-1 };
    socket.emit('write task', write_task);
    document.getElementById("add_task").innerHTML = '';
  });
};

//newTask
socket.on('write task', function(task){
  $('#task_sort').append($("<div class='projects' id='"+task.task_id+"'></div>").text(task.text));
});

//Delete Task
socket.on('delete task', function(task){
  var del = document.getElementById(task.t_id);
  del.parentNode.removeChild(del);    
});

function delTask(del_task){
  socket.emit('delete task', del_task);
}

//Reorder Tasks
socket.on('reorder tasks', function(newTaskOrder){
  newTaskOrder.forEach(function (a,b){
  {
    if (a == '' ){newTaskOrder.splice(a,1) }
    else
    {
      var thing = document.getElementById(a);
      document.getElementById('task_sort').appendChild(thing);
    }
  }});
});
