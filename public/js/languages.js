window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.languages = function initLanguages() {
  var langSearch = document.getElementById('lang-search');
  var langEdit = document.getElementById('lang-edit');
  var langAdd = document.getElementById('lang-add');

  langEdit.onsubmit = function(evt) {
    evt.preventDefault();
  };

  langAdd.onsubmit = function(evt) {
    evt.preventDefault();
    createLanguage(
      langAdd.code.value,
      langAdd.langName.value
    );
  };

  var children = langEdit.querySelectorAll('[type=submit]');
  for(var i = 0; i<children.length; i++) {
    children[i].addEventListener('click', handleEditSubmit);
  }

  function handleEditSubmit(evt) {
    var el = evt.target || evt.srcElement;

    if(el.id === 'lang-delete-btn') {
      removeLanguage(langEdit.code.value);
    }
    else if(el.id === 'lang-update-btn') {
      var newCode = langEdit.code.value;
      var oldCode = document.getElementById('lang-edit').dataset.oldCode;
      var newName = langEdit.langName.value;
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

  function removeLanguage(code) {
    socket.emit('lang.remove', {
      code: code,
      token: window.HLRDESK.token
    });
  }

  function createLanguage(code, name) {
    socket.emit('lang.create', {
      code: code,
      name: name,
      token: window.HLRDESK.token
    });
  }

  var socket = io();

  langSearch.addEventListener('input', handleSearch);

  socket.on('alert', function(data){window.HLRDESK.alert.error(data)});
  socket.on('lang.itemRemoved', removeLanguageOption);
  socket.on('lang.itemAdded', function() {} /** TODO **/);

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
    langEdit.code.value = opt.dataset.code;
    langEdit.langName.value = opt.dataset.name;
  }
};
