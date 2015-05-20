window.HLRDESK.init.checkin = function() {
  var socket = io();

  var employee = window.patron
  socket.on('checkin event', clearItems);

  function checkin() {
    $(".selected").each(function() {

      socket.emit('checkin event', {
        call: $(this).data('call'),
        patron: $(this).data('patron'),
        domid: this.id, // add so we know what to clear from client's table
        token: window.HLRDESK.token
      });
    });
  }

  function clearItems(data){
    var selected = document.getElementById(data.domid);
    selected.parentNode.removeChild(selected);
    toggleDisabledButtons();
  }

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
  document.querySelector('.check-in-btn').addEventListener ("click", checkin);

  function toggleDisabledButtons() {
    var checkInButton = document.querySelector('.check-in-btn')
    var selected = document.querySelectorAll('.selected');

    if(selected.length === 0) {
      checkInButton.setAttribute('disabled','disabled');
    }
    else
    {
      checkInButton.removeAttribute('disabled');
    }
  }

  $("#checked-out-items tbody tr").click(function(evt){
    if( (evt.target || evt.srcElement).classList.contains('due-extend') ) {
      $(this).find('input[type=date]').toggleClass('active');
      return;
    }
    $( this ).toggleClass( "selected" );
    toggleDisabledButtons();
  });

  $("#add").click(function(){
    $( '#checked-out-items tbody tr:visible' ).addClass( "selected" );
  });

  $("#remove").click(function(){
    $( '#checked-out-items tbody tr:visible' ).removeClass( "selected" );
  });
}
