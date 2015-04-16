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
}
