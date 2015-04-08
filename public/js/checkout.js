window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.checkout = function initCheckout() {
  var searchAvailable = 'onsearch' in document.documentElement;
  var socket = io();
  var searchEl = document.getElementById('check-out-search');
  var searchForm = document.getElementById('check-out-form');
  var results = document.querySelector('#check-out-search-results ul');
  var resultsCount = document.querySelector('#check-out-search-results .results-count');
  var selected = document.querySelector('#check-out-search-selection ul');
  var checkOutPrompt = document.getElementById('check-out-prompt');
  var checkOutButton = document.querySelector('#check-out-search-selection .check-out-btn');

  var FIREFOX_SEARCH_DEBOUNCE_TIME = 250;

  var selectedItems = {};

  var SATCHEL_ANIMATION_DURATION = 250; // MUST MATCH WHAT IS IN CSS

  searchForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
  });

  checkOutButton.addEventListener('click', function handleCheckoutClick() { 
    var close = window.patternlibrary.displayModal(checkOutPrompt);
    var checkOutPromptClose = document.querySelector('.modalWindow .close.check-out-prompt');
    checkOutPromptClose.onclick = close;
    appendInventory(document.querySelector('.modalWindow .check-out-prompt.inventory'));
  });

  socket.on('inv.search.results', populateResults);

  if(searchAvailable) {
    searchEl.addEventListener('search', handleSearchEvt);
  }
  else
  {
    var changeDebounce = null;
    searchEl.addEventListener('keyup', function(evt) {
      window.clearTimeout(changeDebounce);
      changeDebounce = window.setTimeout(handleSearchEvt, FIREFOX_SEARCH_DEBOUNCE_TIME);
    });
  }

  function appendInventory(ol) {
    var items = selected.querySelectorAll('li');
    var fragment = document.createDocumentFragment();

    var tpl = document.getElementById('tpl-checkout-popup-li');
    for(var i = 0; i<items.length; i++) {
      var node = document.importNode(tpl.content, true);
      var li = node.querySelector('li');
      
      var call  = items[i].getAttribute('data-call'),
          copy  = items[i].getAttribute('data-copy'),
          title = items[i].getAttribute('data-title');

      li.querySelector('.title').textContent = title;
      li.querySelector('.call').textContent = call;
      li.querySelector('.copy').textContent = copy;

      fragment.appendChild(li);
    }
    ol.appendChild(fragment);
  }

  function handleSearchEvt() {
    var text = searchEl.value;
    if(text === '') {
      clearResults();
      return;
    }

    socket.emit('inv.search', {'text': text, token: window.HLRDESK.token});
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

    var helpText = document.querySelector('#check-out-search-results .help');
    if(count === 0) {
      helpText.classList.add('active');
    }
    else
    {
      helpText.classList.remove('active');
    }

    items.forEach(function(item) {
      // don't display stuff that's already here
      var copies = item.copies_available.filter(function(copy) {
        if(selectedItems[item.call_number] !== undefined) {
          if(selectedItems[item.call_number].indexOf(copy) !== -1) {
            return false;
          }
        }
        return true;
      });
      copies.sort();
      copies.forEach(function(copy) {
        var tpl = document.getElementById('tpl-satchel-li');
        var node = document.importNode(tpl.content, true);
        var li = node.querySelector('li');
        li.querySelector('.title').textContent = item.title;
        li.querySelector('.call').textContent = item.call_number;

        if(item.quantity > 1) {
          // the copy number is redundant if there is only one item of this call
          li.querySelector('.copy').textContent = copy;
        }

        li.setAttribute('data-call', item.call_number);
        li.setAttribute('data-title', item.title);
        li.setAttribute('data-copy', copy);
        li.addEventListener('click', function(){
          if(li.parentNode === results) {
            swapLocation(li);
          }
        });
        li.querySelector('.closeBtn').addEventListener('click', function() {
          swapLocation(li);
        });
        fragment.appendChild(node);
      });
    });
    results.appendChild(fragment);
  }

  function addToCollection(call, copy) {
    var icopy = Number(copy);
    selectedItems[call] = selectedItems[call] || [];
    if(selectedItems[call].indexOf(icopy) !== -1) {
      throw "Copy " + icopy + " already selected for checkout for call " + call;
    }
    selectedItems[call].push(icopy);
  }

  function removeFromCollection(call, copy) {
    var icopy = Number(copy);
    var item = selectedItems[call];
    if(item === undefined) {
      throw "Cannot remove call " + call + " from items selected for checkout. Does not exist.";
    }
    var idx = item.indexOf(icopy);
    if(idx === -1) {
      throw "Cannot remove copy " + icopy + " of call " + call + " from items selected for checkout. Does not exist.";
    }
    item.splice(idx, 1);
  }

  function swapLocation(el) {
    el.classList.remove('incoming');
    
    // debounce
    if(el.classList.contains('outgoing')) {
      return;
    }
    el.classList.add('outgoing');
    var intoSatchel = el.parentNode === results ? true : false;
    var opposite = null;
    var call = el.getAttribute('data-call');
    var copy = el.getAttribute('data-copy');
    
    if(intoSatchel) {
      opposite = selected;
      addToCollection(call, copy);
    }
    else
    {
      opposite = results;
      removeFromCollection(call, copy);
    }

    window.setTimeout(function removeFromCollection() {
      opposite.appendChild(el);
      el.classList.remove('outgoing');
      el.classList.add('incoming');
      window.setTimeout(function removeIncomingClass() {
        el.classList.remove('incoming');
      }, SATCHEL_ANIMATION_DURATION);

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
