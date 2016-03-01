window.HLRDESK = window.HLRDESK || {};
window.HLRDESK.init = window.HLRDESK.init || {};

window.HLRDESK.init.media = function initMedia() {
  var delBtns = document.querySelectorAll('#media-add-form [name=delete]');
console.log(delBtns);
  for(var i = 0; i<delBtns.length; i++) {
    delBtns[i].addEventListener('click', function(evt) {
      var el = evt.target.parentElement;
      var b = $(el).attr('value');
      var q = "Are you sure you want to delete " + b + "?";
      console.log(b);//TODO 
      
      if(!confirm(q)) {
        evt.preventDefault();
      }
    });
  }
};
