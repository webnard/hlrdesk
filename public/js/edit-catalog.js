window.HLRDESK.init.editCatalog = function() {

  var socket = window.io();

  socket.on('getInfo', function(result){
    type = 'update';
    origCall = result.call;
    $('#callNumber').attr('value', result.call);
    $('#callNumber').attr('placeholder', result.call);
    
    $('#quantity').attr('value', result.quantity);
    $('#quantity').attr('placeholder', result.quantity);
    
    $('#title').attr('value', result.title);
    $('#title').attr('placeholder', result.title);

    $('#checkoutLength').attr('value', result.checkout_period);
    $('#checkoutLength').attr('placeholder', result.checkout_period);
    
    $('#onReserve').attr('checked', result.is_reserve);
    
    $('#duplicatable').attr('checked', result.is_duplicatable);
    
    $('#HLROnline').attr('checked', result.on_hummedia);
    
    var date = result.date_added.substring(0,10);
    $('#dateAdded').attr('value', date);
    
    $('#editedBy').attr('value', result.edited_by);
    
    if ($('#editedBy').attr('value'))
    {
      var edited = result.date_edited.substring(0,10);
      if (edited)
      {
        $('#dateEdited').attr('type', 'date');
      }
      $('#dateEdited').attr('value', edited);
    }
    else{
      $('#dateEdited').attr('value', " N/A");
      $('#editedBy').attr('value', " N/A");
     }
   
    $('#notes').attr('value', result.notes);
    $('#notes').attr('placeholder', result.notes);

    //$(".Item").click(updateDatabase);        



  });
  
  window.HLRDESK.plugins.search({
    search: '#editCatalog-search',
    results: '#editCatalog-search-results',
    
    clickCallback: function()
    {
      var item = this;
      var item = { "callNum":this.dataset.call, token: window.HLRDESK.token }
      socket.emit('getInfo', item);
      var editItem = document.getElementById('editItem');
      openModal = window.patternlibrary.displayModal(editItem);
      hideCheckedOut: false
    }
  });

}
