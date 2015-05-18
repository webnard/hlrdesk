var admins = window.allAdmins;
var notify = window.notify;
var userToMake = window.toMk;
var csrf  = window.csrf;

if (notify){
  if (confirm('This person is not in the data-base (they pobably have not signed in before) would you like to make them an admin anyway?')) {
    document.getElementById("admin_name").value = userToMake;
    document.getElementById("override").value = "true";
    document.getElementById("csrf").value = csrf;
    console.log("Resubmiting form");
    document.getElementById("admin_form").submit();
  } else {
    // Do nothing!
  }
}


var admins_string = "<p>Current Admins</p><ol>"

for (var i = 0; i < admins.length; i++){
  admins_string += "<li><form method='POST'><body>"+admins[i].netid + "</body><button type='submit' class='redBtn' style='padding: 0.2em'>Remove</button><input type = 'hidden' name='user' value = "+admins[i].netid+"><input type='hidden' value='remove' name='action' /><input type = 'hidden' id = 'csrf' value = '"+window.csrf+"' name = 'csrf' /></form></li>"
}

admins_string += "</ol>"


document.getElementById("admin_list").innerHTML = admins_string;
