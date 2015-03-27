window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.checkout = function initCheckout() {
  var socket = io();
  var searchEl = document.getElementById('check-out-search');
  var searchForm = document.getElementById('check-out-form');

  searchForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
  });

  socket.on('inv.search.results', populateResults);

  searchEl.addEventListener('search', handleSearchEvt)

  function handleSearchEvt() {
    var text = searchEl.value;
    if(text === '') {
      clearResults();
      return;
    }

    socket.emit('inv.search', {'text': text});
  }

  function clearResults() {
    document.getElementById('check-out-search-results').innerHTML='';
  };

  function populateResults(items) {
    clearResults();
    var fragment = document.createDocumentFragment();
    items.forEach(function(item) {
      var li = document.createElement('li');
      li.textContent = item.title;
      fragment.appendChild(li);
    });
    document.getElementById('check-out-search-results').appendChild(fragment);
  }
};
