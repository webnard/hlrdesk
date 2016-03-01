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
    document.getElementById("caption").classList.remove("aboveLoader");
    if(href.indexOf('?') === - 1) {
      href += '?ajax=true';
    }
    else
    {
      href += '&ajax=true';
    }
    checkForUnread();

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
  
  $('document').ready(function(){checkForUnread();});
  var socket = window.io();
  function checkForUnread(){
    socket.emit('unread message', {token: window.HLRDESK.token});
  };
    
  socket.on('unread message', function(){
    $("#messageDisplay").show().one();
  });
  
})();

window.HLRDESK.init.messages();

function showMessage(){//not working because the javascript doesn't load for msg.js functions until it is loaded
  $("#messageDisplay").show().one();
  /*  colors = ['#FA191C', '#af2527' ]
    var i = 0;
    animate_loop = function() {
            $('.fa-envelope').animate({color:colors[(i++)%colors.length]
            }, 1000, function(){
                        animate_loop();
            });
    }
    animate_loop();//TODO this is a little hacky, get a regular animation working (not supported the way I am doing it)
    */
  }
