var _ = require('koa-route')
var koa = require('koa')
var serve = require('koa-static')
var render = require('koa-ejs')
var path = require('path')
var fs = require('fs');
var assert = require('assert');

var socket = require('koa-socket');

var session = require('koa-session')
var parse = require('co-body')
var csrf = require('koa-csrf')

var app = koa();

require('koa-csrf')(app)

var email = require('./app_modules/email')

var auth = require('./app_modules/auth')
var db = require('./app_modules/db')
const ENV = process.env;
const SERVICE = auth.service(ENV.HLRDESK_HOST, ENV.PORT, '/signin', !ENV.HLRDESK_DEV);

if(ENV.HLRDESK_DEV) {
  app.use(require('./app_modules/koa-sassy').Sassy);
}

app.keys = ['TODO MAKE ME AN ENV VARIABLE', 'I SHOULD NOT BE HARDCODED', 'MY DOG HAS NO NOSE', 'HOW DOES HE SMELL?', 'AWFUL'];
app.use(session());

app.use(serve(path.join(__dirname, '..', 'public')));

if(ENV.NODE_TEST === 'true') {
  // e.g., /logmein?as=prabbit
  // see tests/sessions/* for available users
  require('./app_modules/mock-login')(app);
}

app.use(function*(next){
  const WHITELIST = ['/signin', '/logmein', '/logout'];
  if (!this.session.user && WHITELIST.indexOf(this.request.path) === -1){
    this.session.login_redirect = this.request.path + this.request.search;
    this.redirect('https://cas.byu.edu/cas/login?service=' + SERVICE);
    return;
  }
  else{
    yield next;
  }
})

render(app, {
  root: path.join(__dirname, 'templates'),
  layout: 'layout',
  viewExt: 'html',
  cache: !ENV.HLRDESK_DEV,
  debug: ENV.HLRDESK_DEV,
  locals: {
    title: 'HLRDesk',
    token: function() {
      return this.session.token;
    }
  }
});

app.use(function *(next) {
  if(this.request.header['x-requested-with'] === 'XMLHttpRequest')
  {
    this.USE_LAYOUT = false;
  }
  else
  {
    this.USE_LAYOUT = 'layout';
  }
  yield next;
});

app.use(_.get("/", function *(next) {
  var rdir = this.session.login_redirect;
  if(rdir) {
    this.redirect(rdir);
    delete this.session.login_redirect;
    yield next;
    return;
  }
  yield this.render('layout', {layout: false, body:""});
  yield next;
}));

app.use(_.get("/message", function *() {
  var client = db();
  var all_messages = yield client.query("SELECT * FROM messages;");
  var all_tasks = yield client.query("Select * FROM tasks ORDER BY priority ASC");
  yield this.render('msg', {layout: this.USE_LAYOUT, all_messages: all_messages, all_tasks: all_tasks});
}));

app.use(_.get('/check-in', function *() {
  var inv = require('./app_modules/inventory');
  var items = yield inv.checked_out;

  yield this.render('catalog/check-in', {
    items: items,
    moment: require('moment'),
    title: "Check In",
    layout: this.USE_LAYOUT
  });
}));

app.use(_.get('/check-out', function *() {
  yield this.render('catalog/check-out', {
    title: "Check Out",
    layout: this.USE_LAYOUT
  });
}));

app.use(_.get('/edit-catalog', function *() {
  var client = db();
  var media_types = yield client.query("SELECT * FROM media ORDER BY media ASC;");
  var lang = yield client.query("SELECT * FROM languages ORDER BY name ASC;");
  yield this.render('catalog/edit-catalog', {
    title: "Edit Item",
    layout: this.USE_LAYOUT,
    media_types: media_types,
    lang: lang
  });
}));

app.use(_.get('/viewHistory', function *() {
  var client = db();
  yield this.render('catalog/viewHistory', {
    title: "Item History",
    layout: this.USE_LAYOUT,
  });
}));

app.use(_.get("/extras", function *() {
  yield this.render('extras', {layout: this.USE_LAYOUT });
}));

app.use(_.get("/calendar", function *() {
  var client = db();
  var allCalendarEvents = yield client.query("SELECT * FROM calendar;");
  var isAdmin = yield auth.isAdmin(this.session.user);
  yield this.render('calendar', {layout: this.USE_LAYOUT, date: new Date(), allCalendarEvents: allCalendarEvents, user: this.session.user, isAdmin:isAdmin});
}));

app.use(_.get("/signin", function *(next){
  ticket=this.request.query.ticket;
  var obj = yield auth.cas_login(ticket, SERVICE);
  auth.login(this, obj);
  this.redirect('/');
  yield next;
}));

app.use(_.get("/languages", function*() {
  yield this.render('languages', {
    layout: this.USE_LAYOUT,
    languages: yield require('./app_modules/language').list
  });
}));

app.use(_.get("/media", function*() {
  yield this.render('media', {
    layout: this.USE_LAYOUT,
    media: yield require('./app_modules/media').list,
    csrf: this.csrf
  });
}));

app.use(_.post('/media', function*() {
  var media = require('./app_modules/media');
  var body = yield parse(this); // co-body or something

  try {
    this.assertCSRF(body.csrf);
    assert(yield auth.isAdmin(this.session.user));
  }catch(err) {
    this.status = 403
    this.body = {
      message: 'Unauthorized'
    };
    return;
  }

  if(body['delete']) {
    yield media.remove(body['delete']);
  }
  else if(body['create']) {
    yield media.add(body['new-media']);
  }

  this.redirect('/media');
}));

app.use(_.get("/logout", function *(){
  this.session = null;
  var s = this.request.query.service || null;
  var url = 'https://cas.byu.edu/cas/logout' + (s ? '?service=' + s : '');
  this.redirect(url);
}));

app.use(_.post("/mkadmin",function *(){
  var body = yield parse(this) // co-body or something
  try {
    this.assertCSRF(body.csrf);
    to_mk=body.user;
    override = (body.override=="true");
    status = yield auth.mkadmin(this.session.user, to_mk, override);
    if(!status){
      this.redirect('/mkadmin?status='+status+'&toMk='+to_mk);
    }
    else{
      this.redirect('/mkadmin');
    }
  }
  catch (err) {
    this.status = 403
    this.body = {
      message: 'This CSRF token is invalid!'
    }
    return
  }
}));

app.use(_.get("/mkadmin",function *(){
  var isAdmin = yield auth.isAdmin(this.session.user);
  var client = db();
  var allAdmins = yield client.query("SELECT netid FROM users WHERE admin = TRUE;");
  if (isAdmin){
    if (this.request.query.status == "false"){
      yield this.render('mkadmin', {layout: this.USE_LAYOUT, csrf: this.csrf, allAdminsFromDB: allAdmins, alert : true, to_mk : this.request.query.toMk});
    }
    else{
      yield this.render('mkadmin', {layout: this.USE_LAYOUT, csrf: this.csrf, allAdminsFromDB: allAdmins, alert : false, to_mk : undefined});
    }
  }
  else{
    this.status = 403
    this.body = {
      message: 'Wrong place friend!'
    }
    return
  }
}));

socket.start(app);

socket.use(function*(next){
  this.socket.user = yield auth.getUser(this.data.token);
  delete this.data.token;
  yield next;
});

// Load in all socket files
fs.readdir(path.join(__dirname, 'sockets'), function (err, files) {
  if(err) {
    throw new Error(err);
  }
  var socket_files = files.filter(function(file) {
    return file.match(/\.js$/);
  });
  socket_files.forEach(function(file){
    try {
      require(path.join(__dirname, 'sockets', file))(socket, app);
    }
    catch(e) {
      console.error("Initializing sockets/" + file + " failed.", e);
      throw e;
    }
  });
});

module.exports = app.server;
