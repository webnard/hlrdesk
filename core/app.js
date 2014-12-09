var _ = require('koa-route')
var koa = require('koa') //adds koa
var serve = require('koa-static')
var render = require('koa-ejs')
var path = require('path')
var sassy = require('./app_modules/koa-sassy')

var fs = require('fs');

var config=require('./config1')

var app = koa();

var auth = require('./app_modules/auth')

if(config.debug) {
  var sassdir = path.join(__dirname, 'sass');
  var cssdir = path.join(__dirname, '..', 'public', 'css');

  var options = {
    outDir: cssdir
  };

  app.use( sassy(sassdir, '/css/', options) );
}

app.use(serve(path.join(__dirname, '..', 'public')));

render(app, {
  root: path.join(__dirname, 'templates'),
  // include when we have a layout to use
  layout: 'layout',
  viewExt: 'html',
  cache: !config.debug,
  debug: config.debug,
  locals: {
  title: 'HLRDesk'
  }
});

app.use(_.get("/", function *() {
  yield this.render('login', {layout: false});
}));

app.use(_.get("/signin", function *(){
  var service = config.localhost + ':' + config.port + '/signin';
  ticket=this.request.query.ticket;

  try {
    var obj= yield auth.cas_login(ticket, service);
    // do something with obj.username
    this.redirect('/');
  }catch(e) {
    this.body="There seems to have been a problem. Please try again.";
  }
}));

app.listen(config.port)
