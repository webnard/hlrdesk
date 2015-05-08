(function(){
  var socket = io();

  var employee = window.patron
  console.log(employee)
  socket.on('checkin event', function(event){
  })

  window.checkin = function() {
    var num_selected = $(".selected").length
    var call_list = []
    var patron_list = []
    for (i=0; i < num_selected; i++){
      call_number = $(".selected").eq(i).children(":first").text()
      patron = $(".selected").eq(i).children(":first").next().next().text()
      call_list.push(call_number);
      patron_list.push(patron);
    }
    for (i=0; i<call_list.length; i++){
      socket.emit('checkin event', {"call" : call_list[i], "patron" : patron_list[i], 'employee' : employee});
    }
  }
})();

window.HLRDESK.init.checkin = function() {
  $("#filter").keyup(function(){
    var filter = $(this).val(), count = 0;
    $("tbody tr").each(function(){
      if ($(this).text().search(new RegExp(filter, "i")) < 0){$(this).fadeOut(300);}
      else {$(this).show(); count++;}
    });
    var numberItems = count;
    $("#filter-count").text(count + " Items");
  });

  var myTextExtraction = function(node) {
    // extract data from markup and return it
    return $(node).data("date")||$(node).text()
  }
  $(".checkIN").tablesorter( {textExtraction: myTextExtraction} );
  function checkInItems(evt){
    evt.preventDefault();
    var selected = document.querySelectorAll('.selected');
    for(var i = 0; i<selected.length; i++){
      selected[i].parentNode.removeChild(selected[i]);
    };
  }
  document.querySelector('.check-in-btn').addEventListener ("click", checkInItems);

  $("#checked-out-items tbody tr").click(function(){
    $( this ).toggleClass( "selected" );
    var checkInButton = document.querySelector('.check-in-btn')
    var selected = document.querySelectorAll('.selected');
    var extendButton = document.querySelector('.extend-btn')

  if(selected.length === 0) {
    checkInButton.setAttribute('disabled','disabled');
    extendButton.setAttribute('disabled','disabled');
  }
  else
  {
    checkInButton.removeAttribute('disabled');
    extendButton.removeAttribute('disabled');
  }
  });
  
  $("#add").click(function(){
    $( '#checked-out-items tbody tr:visible' ).addClass( "selected" );
  });
  
  $("#remove").click(function(){
    $( '#checked-out-items tbody tr:visible' ).removeClass( "selected" );
  });
}
