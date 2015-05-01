window.HLRDESK.init.viewHistory = function() {

  var socket = window.io();

  socket.on('getHistory', function(result)
  {
    for (var i = 0; i < result.rows.length; i++)
    {
      if (i==0)
      {
        $('.list').append('<tr><td class=top>Call Number</td>'
        + '<td class=top>Type</td>'
        + '<td class=top>NetID</td>'
        + '<td class=top>Title</td>'
        + '<td class=top>Time Stamp</td>'
        + '<td class=top>Description</td>'
        + '</tr>');
      }
      $('.list').append('<tr><td>'+result.rows[i].call_number+'</td>'
      + '<td>' + result.rows[i].type +'</td>'
      + '<td>' + result.rows[i].who +'</td>'
      + '<td>' + result.rows[i].title +'</td>'
      + '<td>' + result.rows[i].date_changed + '></td>'
      + '<td>' + result.rows[i].notes +'</td>'
      + '</tr>');
    }
  });

  window.HLRDESK.plugins.search({
    search: '#editCatalog-search',
    results: '#editCatalog-search-results',
    
    clickCallback: function()
    {
      var item = this;
      var item = { "callNum":this.dataset.call, token: window.HLRDESK.token }
      socket.emit('getHistory', item);
      var editItem = document.getElementById('editItem');
      openModal = window.patternlibrary.displayModal(editItem);
      hideCheckedOut: false
    }
  });

}
