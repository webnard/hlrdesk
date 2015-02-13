var events = allEvents.rows;

var socket = io();

var selectedTime;
var selectedDate;
var selectedRoom;
var eventTitle;

var weekDiff = 0;
var now = new Date();
var cellDate = now;
var displayedDate = now.toDateString();
var days = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var currentView = "week";

document.getElementById("displayRoomSelect").addEventListener("change", function(event) {updateGrid()});
document.getElementById("dateSelect").addEventListener("change", function(event) {updateCell()});
document.getElementById("timeSelect").addEventListener("change", function(event) {updateCell()});
document.getElementById("roomSelect").addEventListener("change", function(event) {updateCell(); document.getElementById("displayRoomSelect").selectedIndex = document.getElementById("roomSelect").selectedIndex; updateGrid()});
document.getElementById("durationSelect").addEventListener("change", function(event) {updateCell()});
document.getElementById("forwardBtn").addEventListener("click", function() {changeWeek(1)});
document.getElementById("backBtn").addEventListener("click", function() {changeWeek(-1)});
document.getElementById("switchView").addEventListener("click", function() {changeView()});
document.getElementById("previousDay").addEventListener("click", function() {changeDay(-1)});
document.getElementById("nextDay").addEventListener("click", function() {changeDay(1)});
document.getElementById("saveButton").addEventListener("click", function() {submit()});

function updateGrid() {

  var cells = document.querySelectorAll(((currentView === "week") ? "#weekView":"#dayView")+" td");
  if (document.getElementsByClassName("selected")[0]) {
    var selectedCell = document.getElementsByClassName("selected")[0];
  }
  if (currentView === "week") {
    for (var i = 0; i < cells.length; i++) {
      cells[i].className = "";
      for (var j = 0; j < events.length; j++) {
        if (document.getElementById(new Date(events[j].time).toDateString()) && new Date(events[j].time).getDay().toString() === cells[i].dataset.day && new Date(events[j].time).getHours().toString() === cells[i].dataset.time && events[j].room === document.getElementById("displayRoomSelect").value) {
          if (userName == events[j].user) {
            markCellAsBookedByUser(cells[i], events[j]);
          } else {
            markCellAsRequested(cells[i], events[j]);
          }
          break;
        }
      }
      if (cells[i].className === "") {
        if (weekDiff < 0 || (weekDiff === 0 && (cells[i].dataset.day < now.getDay() || (cells[i].dataset.day == now.getDay() && cells[i].dataset.time < now.getHours())))) {
          markCellAsDisabled(cells[i]);
        } else {
          markCellAsEnabled(cells[i]);
        }
      }
    }
    document.getElementById("roomSelect").selectedIndex = document.getElementById("displayRoomSelect").selectedIndex;
  } else if (currentView === "day") {
    for (var i = 0; i < cells.length; i++) {
      cells[i].className = "";
      for (var j = 0; j < events.length; j++) {
        if (displayedDate === new Date(events[j].time).toDateString() && cells[i].dataset.time === new Date(events[j].time).getHours().toString() && events[j].room === cells[i].dataset.room) {
          if (userName == events[j].user) {
            markCellAsBookedByUser(cells[i], events[j]);
          } else {
            markCellAsRequested(cells[i], events[j]);
          }
          break;
        }
      }
      if (cells[i].className == "") {
        if (now.toDateString() == displayedDate &&  cells[i].dataset.time < now.getHours()) {
          markCellAsDisabled(cells[i]);
        } else {
          markCellAsEnabled(cells[i]);
        }
      }
    }
  }
  if (selectedCell) {
    clickCell(selectedCell);
    selectedCell = null;
  }
}
updateGrid();
if (now.getHours() >= 21 && now.getDay() == 6) {changeWeek(1)}

function markCellAsBookedByUser(cell, event) {
  cell.className = "bookedByUser";
  cell.removeEventListener("click", clickCell);
  cell.addEventListener("click", deleteCell);
  cell.innerHTML = event.title+" - "+event.user+"<br>X";
}
function markCellAsRequested(cell, event) {
  cell.className = "requested";
  cell.removeEventListener("click", clickCell);
  cell.innerHTML = event.title+" - "+event.user;
}
function markCellAsDisabled(cell) {
  cell.className = "disabled";
  cell.removeEventListener("deleteCell", deleteCell);
  cell.removeEventListener("click", clickCell);
  cell.innerHTML = "";
}
function markCellAsEnabled(cell) {
  cell.removeEventListener("click", deleteCell);
  cell.className = "";
  cell.addEventListener("click", clickCell);
  cell.innerHTML = "";
}

function clickCell(event) { //places the popup box
  var cell = event.srcElement ? event.srcElement : event;
  while (cell.className != "") {
    if (document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time)+1))) {
      cell = document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time)+1));
    } else {
      cell = null;
      document.getElementById("popup").className = "hidden";
      alert("Sorry, the requested time slot is not available. Please select a different time or room.")
      break;
    }
  }

  while (document.getElementsByClassName("selected").length > 0) {
    document.getElementsByClassName("selected")[0].classList.remove("selected");
  }
  for (var i = 1; i <= Number(document.getElementById("durationSelect").value); i++) {
    document.getElementById((currentView === "week" ? days[cell.dataset.day] : cell.dataset.room)+" "+(Number(cell.dataset.time)+(i-1))).className = "selected";
  }

  document.getElementById("popup").className = "popup";
  document.getElementById("popup").style.top = currentView == "week"  ? ((cell.offsetTop-document.getElementById("popup").offsetHeight+(document.getElementById("weekView").offsetHeight/14)-13)+document.getElementById("weekView").offsetTop).toString()+"px" : ((cell.offsetTop-document.getElementById("popup").offsetHeight+(document.getElementById("dayView").offsetHeight/14)-13)+document.getElementById("dayView").offsetTop).toString()+"px";
  document.getElementById("popup").style.left = (cell.offsetLeft.toString()-((document.getElementById("popup").offsetWidth-cell.offsetWidth)/2))+"px";

  for (var i = 0; i < document.getElementById("dateSelect").length; i++) { //selects right date
   if (new Date(document.getElementById("dateSelect").options[i].value).toDateString() == new Date((currentView === "week") ? new Date(new Date().setDate(now.getDate()+7*weekDiff+(cell.dataset.day-now.getDay()))) : cellDate = new Date(displayedDate)).toDateString()) {
      document.getElementById("dateSelect").selectedIndex = i;
   }
  }

  for (var i = 8; i <= 20; i++) {  //selects right time
    if (now.getHours() > i && document.getElementById("dateSelect").value === now.toDateString()) {
      document.getElementById("timeSelect").options[i-8].disabled = true;
    } else {
      document.getElementById("timeSelect").options[i-8].disabled = false;
    }
  }
  document.getElementById("timeSelect").selectedIndex = cell.dataset.time-8;

	if (currentView === "day") { //selects right room
		for (var i = 0; i < document.getElementById("roomSelect").options.length; i++) {
			if (document.getElementById("roomSelect").options[i].value == cell.dataset.room) {
				document.getElementById("roomSelect").selectedIndex = i;
			}
		}
	}
}

function updateCell() {
  while (document.getElementsByClassName("selected").length > 0) {
    document.getElementsByClassName("selected")[0].classList.remove("selected");
  }
  if (currentView == "week") {
    if (new Date(document.getElementById("dateSelect").value) >  new Date(document.getElementsByClassName("day")[5].id)) {
      do {changeWeek(1)} while (new Date(document.getElementById("dateSelect").value) >  new Date(document.getElementsByClassName("day")[5].id));
    } else if (new Date(document.getElementById("dateSelect").value) <  new Date(document.getElementsByClassName("day")[0].id)) {
      do {changeWeek(-1)} while (new Date(document.getElementById("dateSelect").value) <  new Date(document.getElementsByClassName("day")[0].id));
    }
    clickCell(document.getElementById(days[new Date(document.getElementById("dateSelect").value).getDay()]+" "+(document.getElementById("timeSelect").selectedIndex+8)));
  } else if(currentView == "day") {
    if (new Date(document.getElementById("dateSelect").value).toDateString() != displayedDate) {
      changeDay((new Date(document.getElementById("dateSelect").value).getTime() - new Date(displayedDate).getTime())/86400000);
    }
    clickCell(document.getElementById(document.getElementById("roomSelect").value+" "+(document.getElementById("timeSelect").selectedIndex+8)));
  }
}

function changeWeek(direction) {
  document.getElementById("popup").className = "hidden";
  weekDiff = weekDiff+direction;
  var tableDays = document.getElementsByClassName("day");
  for (var i = 0; i <= 5; i++) {
    tableDays[i].innerHTML = days[i+1] +" "+ (new Date(new Date(tableDays[i].id).getTime() + 604800000*direction).getDate()).toString();
    tableDays[i].id = new Date(new Date(tableDays[i].id).getTime() + 604800000*direction).toDateString();
  }
  updateGrid();
  document.getElementById("backBtn").disabled = (weekDiff === 0) ? true : false;
  document.getElementById("forwardBtn").disabled = (weekDiff >= 2) ? true : false;
}

function changeDay(direction) {
  displayedDate = new Date(new Date(displayedDate).getTime() + 86400000*direction).toDateString();
  if (new Date(displayedDate).getDay() === 0) {displayedDate = new Date(new Date(displayedDate).getTime() + 86400000*direction).toDateString()} //needs optimization
  document.getElementById("date").innerHTML = displayedDate;
  updateGrid();
  document.getElementById("previousDay").disabled = (displayedDate === now.toDateString()) ? true : false;
  selectedDay = displayedDate;
}

function changeView() {
  document.getElementById("popup").className = "hidden";
  if (currentView === "week") {
    document.getElementById("weekView").classList.toggle("hidden");
    document.getElementById("dayView").classList.toggle("hidden");
    currentView = "day";
  } else if (currentView === "day") {
    document.getElementById("weekView").classList.toggle("hidden");
    document.getElementById("dayView").classList.toggle("hidden");
    currentView = "week";
  }
  while (document.getElementsByClassName("selected")[0]) {
    document.getElementsByClassName("selected")[0].className = "";
  };
  updateGrid();
}

socket.on("calendar event", function(event){
  events.push(event);
  document.getElementById("popup").className = "hidden";
  while (document.getElementsByClassName("selected").length > 0) {
    document.getElementsByClassName("selected")[0].classList.remove("selected");
  }
  updateGrid();
});

socket.on("delete calendar event", function(event) {
  for (var i = 0; i < events.length; i++) {
    if (new Date(events[i].time).toLocaleString() === event.time && events[i].room === event.room) {
       events.splice(i,1);
    }
  }
  document.getElementById("popup").className = "hidden";
  while (document.getElementsByClassName("selected").length > 0) {
    document.getElementsByClassName("selected")[0].classList.remove("selected");
  }
  updateGrid()
});

function deleteCell(event) {
  if(confirm("Are you sure you want to delete this room reservation?")){
    cell = event.srcElement;
    eventDate = new Date((currentView === "week") ? new Date(new Date().setDate(now.getDate()+7*weekDiff+(cell.dataset.day-now.getDay()))) : cellDate = new Date(displayedDate)).toDateString();
    eventTime = new Date(new Date(eventDate).setHours(cell.dataset.time)).toLocaleString();
    socket.emit('delete calendar event', {"room":(currentView === "week" ? document.getElementById("displayRoomSelect").value : cell.dataset.room), "time":eventTime, "user":userName});
  }
}

function submit() {
  eventTitle = document.getElementById("nameInput").value;
  eventTime = new Date(document.getElementById("dateSelect").value+" "+Number(document.getElementById("timeSelect").value)+":00:00").toLocaleString();
  selectedRoom = document.getElementById("roomSelect").value;
  selectedDuration = document.getElementById("durationSelect").value;
  
  socket.emit('calendar event', {"time":eventTime, "room":selectedRoom, "duration":selectedDuration, "title":eventTitle, "user":userName});
}
