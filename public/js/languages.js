window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.languages = function initLanguages() {
  var langSearch = document.getElementById('lang-search');
  var langEdit = document.getElementById('lang-edit');

  langEdit.onsubmit = function(evt) {
    evt.preventDefault();
  };
  var children = langEdit.querySelectorAll('[type=submit]');
  for(var i = 0; i<children.length; i++) {
    children[i].addEventListener('click', handleEditSubmit);
  }

  function handleEditSubmit(evt) {
    var el = evt.target || evt.srcElement;

    if(el.id === 'lang-delete-btn') {
      removeLanguage(document.getElementById('lang-code-edit').value);
    }
    else if(el.id === 'lang-update-btn') {
      var newCode = document.getElementById('lang-code-edit').value;
      var oldCode = document.getElementById('lang-edit').dataset.oldCode;
      var newName = document.getElementById('lang-name-edit').value
      updateLanguage(oldCode, newCode, newName);
    }
  };

  function removeLanguageOption(code) {
    var el = document.querySelector('#langlist option[data-code="' + code + '"]');
    if(el) {
      document.getElementById('langlist').remove(el);
    }
  }

  function updateLanguage(oldCode, newCode, newName) {
    socket.emit('lang.update', {
      oldCode: oldCode,
      newCode: newCode,
      newName: newName,
      token: window.HLRDESK.token
    });
  }

  function deleteLangage(code) {
    socket.emit('lang.delete', {
      code: code,
      token: window.HLRDESK.token
    });
  }

  function addLangage(code, name) {
    socket.emit('lang.add', {
      code: code,
      name: name,
      token: window.HLRDESK.token
    });
  }

  var socket = io();

  langSearch.addEventListener('input', handleSearch);

  socket.on('alert', function(data){window.HLRDESK.alert.error(data)});
  socket.on('lang.itemRemoved', removeLanguageOption);

  function handleSearch(evt) {
    var el = evt.target || evt.srcElement;
    var val = el.value;
    if(!val) {
      langEdit.classList.remove('active');
      return;
    }
    var sanitizedSearch = val.replace(/"/g,'\\"');
    var selector = '#langlist option[value="' + sanitizedSearch + '"]';
    var opt =  document.querySelector(selector);

    if(!opt) {
      return;
    }
    langEdit.classList.add('active');
    langEdit.dataset.oldCode = opt.dataset.code;
    document.getElementById('lang-code-edit').value = opt.dataset.code;
    document.getElementById('lang-name-edit').value = opt.dataset.name;
  }
};
