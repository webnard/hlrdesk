window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.media = function initMedia() {
  var delBtns = document.querySelectorAll('#media-add-form [name=delete]');

  for(var i = 0; i<delBtns.length; i++) {
    delBtns[i].addEventListener('click', function(evt) {
      var el = evt.target.parentElement;
      var q = "Are you sure you want to delete " + el.textContent + "?";
      if(!confirm(q)) {
        evt.preventDefault();
      }
    });
  }
};
