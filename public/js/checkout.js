window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.checkout = function initCheckout() {
  var socket = io();
  var searchEl = document.getElementById('check-out-search');
  var searchForm = document.getElementById('check-out-form');
  var results = document.querySelectorAll('#check-out-search-results ul')[0];
  var resultsCount = document.querySelectorAll('#check-out-search-results .results-count')[0];
  var selected = document.querySelectorAll('#check-out-search-selection ul')[0];
  var checkOutPrompt = document.getElementById('check-out-prompt');
  var checkOutPromptClose = document.querySelectorAll('#check-out-prompt .close')[0];
  var checkOutButton = document.querySelectorAll('#check-out-search-selection .check-out-btn')[0];

  var SATCHEL_ANIMATION_DURATION = 250; // MUST MATCH WHAT IS IN CSS

  searchForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
  });
  checkOutButton.addEventListener('click', function handleCheckoutClick() { 
    var close = window.patternlibrary.displayModal(checkOutPrompt);
    checkOutPromptClose.onclick = close; // TODO: this isn't working
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
    results.innerHTML='';
    resultsCount.innerText = '';
  };

  function populateResults(items) {
    clearResults();
    var fragment = document.createDocumentFragment();
    var count = items.length;
    var plural = count !== 1 ? 's':'';
    resultsCount.innerText = count + ' item' + plural  + ' found';

    var helpText = document.querySelectorAll('#check-out-search-results .help')[0];
    if(count === 0) {
      helpText.classList.add('active');
    }
    else
    {
      helpText.classList.remove('active');
    }

    items.forEach(function(item) {
      var li = document.createElement('li');
      li.textContent = item.title;
      li.attributes['data-call'] = item.call_num;
      li.addEventListener('click', function(){swapLocation(li)});
      fragment.appendChild(li);
    });
    results.appendChild(fragment);
  }

  function swapLocation(el) {
    // prevent multi-clicks
    el.classList.remove('incoming');
    if(el.classList.contains('outgoing')) {
      return;
    }
    el.classList.add('outgoing');
    var opposite = el.parentNode === results ? selected : results;

    window.setTimeout(function removeFromCollection() {
      opposite.appendChild(el);
      el.classList.remove('outgoing');
      el.classList.add('incoming');

      if(selected.children.length === 0) {
        checkOutButton.setAttribute('disabled','disabled');
      }
      else
      {
        checkOutButton.removeAttribute('disabled');
      }
    }, SATCHEL_ANIMATION_DURATION);
  }
};
