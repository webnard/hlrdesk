var _ = require('koa-route')
var koa = require('koa') //adds koa
var serve = require('koa-static')
var render = require('koa-ejs')
var path = require('path')

var fs = require('fs');

var app = koa();

var auth = require('./app_modules/auth')

if(process.env.HLRDESK_DEV) {
  var sass = require('node-sass');
  app.use(function *(next) {
    var matches = this.request.url.match(/^\/css\/(.*)\.css$/);
    if(matches) {
      var filename = matches[1];
      var pubdir = path.join(__dirname, '..', 'public', 'css');
      var sassdir = path.join(__dirname, 'sass');

      try {
        var css = sass.renderSync({
          file: path.join(sassdir, filename + '.scss'),
        });
      }catch(e) {
        console.error(e);
        yield next;
        return;
      }
      fs.writeFileSync(path.join(pubdir, filename + '.css'), css);
    }
    yield next;
  });
}

app.use(serve(path.join(__dirname, '..', 'public')));

render(app, {
  root: path.join(__dirname, 'templates'),
  // include when we have a layout to use
  layout: 'layout',
  viewExt: 'html',
  cache: !process.env.HLRDESK_DEV,
  debug: process.env.HLRDESK_DEV,
  locals: {
  title: 'HLRDesk'
  }
});

app.use(_.get("/", function *() {
  yield this.render('admin_index', {layout: false});
}));

app.use(_.get("/signin", function *(){
  var service = process.env.HLRDESK_HOST + ':' + process.env.PORT + '/signin';
  ticket=this.request.query.ticket;

  try {
    var obj= yield auth.cas_login(ticket, service);
    // do something with obj.username
    this.redirect('/');
  }catch(e) {
    this.body="There seems to have been a problem. Please try again.";
  }
}));

app.listen(process.env.PORT)
