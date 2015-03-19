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
}
