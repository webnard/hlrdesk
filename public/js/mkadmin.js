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


var admins_string = "<ol>"

for (var i = 0; i < admins.length; i++){
  admins_string += "<li>"+admins[i].netid + "</li>"
}

admins_string += "</ol>"


document.getElementById("admin_list").innerHTML = admins_string;
