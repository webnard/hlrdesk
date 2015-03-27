window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.checkout = function initCheckout() {
  var socket = io();
  var searchEl = document.getElementById('check-out-search');
  var searchForm = document.getElementById('check-out-form');
  var searchResults = document.querySelectorAll('#check-out-search-results ul')[0];
  var selectedItems = document.querySelectorAll('#check-out-search-selection ul')[0];
  var loadSpinner = document.querySelectorAll('#check-out-search-results .load-spinner')[0];

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
    loadSpinner.classList.add('active');

    socket.emit('inv.search', {'text': text});
  }

  function clearResults() {
    loadSpinner.classList.remove('active');
    searchResults.innerHTML='';
  };

  function populateResults(items) {
    clearResults();
    var fragment = document.createDocumentFragment();
    items.forEach(function(item) {
      var li = document.createElement('li');
      li.textContent = item.title;
      li.addEventListener('click', addToCart);
      fragment.appendChild(li);
    });
    searchResults.appendChild(fragment);
  }

  function addToCart(evt) {
    var clone = evt.target.cloneNode(true);
    evt.target.classList.add('flash');
    evt.target.classList.remove('flash');
    clone.classList.add('incoming');

    clone.addEventListener('click', removeFromCart);
    selectedItems.appendChild(clone);
  }
  function removeFromCart(evt) {
    selectedItems.removeChild(evt.target);
  }
};
