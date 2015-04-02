// Enables navigation with the administrative sidebar
(function leftNavBar() {
  window.addEventListener('popstate', function(evt) {
    if(!evt.state) { return; }
    loadPage(evt.state.title, evt.state.href);
  });

  function loadPage(title, href) {
    if(!href || href === '/') {
      $("#loader").html('');
      return;
    }

    if(href.indexOf('?') === - 1) {
      href += '?ajax=true';
    }
    else
    {
      href += '&ajax=true';
    }

    document.title = title + ' | HLRDesk';
    $( "#loader" ).load( href );
  }

  $(".lpanel[data-title]").click(function loadMsg(ev){
    var href = $(this).attr('href');
    var title = $(this).data('title');

    history.pushState({href: href, title: title}, title, href);
    ev.preventDefault();
    loadPage(title, href);
  });

  // TODO: account for query strings
  var href = location.pathname + location.search;
  var title = document.title;
  history.pushState({href: href, title: title}, title, href);

})();
