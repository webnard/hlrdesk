// Enables navigation with the administrative sidebar
(function leftNavBar() {
  window.addEventListener('popstate', function(evt) {
    loadPage(evt.state.title, evt.state.href);
  });

  function loadPage(title, href) {
    if(!href || href === '/') {
      $("#loader").html('');
      return;
    }
    document.title = title + ' | HLRDesk';
    $( "#loader" ).load( href );
  }

  $(".lpanel[data-title]").click(function loadMsg(ev){
    var href = $(this).attr('href');
    var title = $(this).data('title');

    history.pushState({href: href, title: title}, title, href + '?ajax=true');
    ev.preventDefault();
    loadPage(title, href);
  });

  // TODO: account for query strings
  var href = location.pathname;
  var title = document.title;
  history.pushState({href: href, title: title}, title, href + '?ajax=true');

})();
