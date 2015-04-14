// Tool for displaying messages to the user
// e.g., window.HLRDESK.alert.error("THE GOGGLES! THEY DO NOTHING!");
window.HLRDESK = window.HLRDESK || {};

(function(H, pl) {
  if(!pl || !pl.displayModal) {
    throw "Pattern library's displayModal method not found!";
  }

  H.alert = {
    error: function(message) { // see core/templates/error-modal.html
      var tpl = document.getElementById('tpl-error-modal');
      var el = document.importNode(tpl.content, true);
      el.querySelector('.error-message').textContent = message;
      pl.displayModal(el);
    }
  }

}(window.HLRDESK, window.patternlibrary));
