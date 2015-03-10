var _ = require('koa-route')
var koa = require('koa')
var serve = require('koa-static')
var render = require('koa-ejs')
var path = require('path')
var cookie = require('cookie');

var socket = require('koa-socket');

var session = require('koa-session')

var app = koa();

var email = require('./app_modules/email')

var auth = require('./app_modules/auth')
var db = require('./app_modules/db')
const ENV = process.env;
const SERVICE = auth.service(ENV.HLRDESK_HOST, ENV.PORT, '/signin', !ENV.HLRDESK_DEV);
var USE_LAYOUT;

if(ENV.HLRDESK_DEV) {
  app.use(require('./app_modules/koa-sassy').Sassy);
}

app.keys = ['TODO MAKE ME AN ENV VARIABLE', 'I SHOULD NOT BE HARDCODED', 'MY DOG HAS NO NOSE', 'HOW DOES HE SMELL?', 'AWFUL'];
app.use(session());

app.use(serve(path.join(__dirname, '..', 'public')));

app.use(function*(next){
  if (!this.session.user && this.request.path!='/signin' && this.request.path!='/logout'){
    this.redirect('https://cas.byu.edu/cas/login?service='+SERVICE)
    return
  }
  else{
    yield next
  }
})

render(app, {
  root: path.join(__dirname, 'templates'),
  // include when we have a layout to use
  layout: 'layout',
  viewExt: 'html',
  cache: !ENV.HLRDESK_DEV,
  debug: ENV.HLRDESK_DEV,
  locals: {
  title: 'HLRDesk'
  }
});

app.use(function *(next) {
  if(this.request.header['x-requested-with'] === 'XMLHttpRequest')
  {
    USE_LAYOUT = false;
  }
  else
  {
    USE_LAYOUT = 'layout';
  }
  yield next;
});

app.use(_.get("/", function *() {
  yield this.render('layout', {layout: false, body:""});
}));

app.use(_.get("/message", function *() {
  var client = db();
  var all_messages = yield client.query("SELECT * FROM messages;");
  var all_tasks = yield client.query("Select * FROM tasks ORDER BY priority ASC");
  //console.log(all_tasks.rows[0]);
  yield this.render('msg', {layout: USE_LAYOUT, all_messages: all_messages, all_tasks: all_tasks});
}));

app.use(_.get('/checked-out', function *() {
  var inv = require('./app_modules/inventory');
  var items = yield inv.checked_out;

  yield this.render('catalog/checked-out', {
    items: items,
    moment: require('moment'),
    title: "Checked Out",
    layout: USE_LAYOUT
  });
}));

app.use(_.get("/calendar", function *() {
  var client = db();
  var allCalendarEvents = yield client.query("SELECT * FROM calendar;");
  yield this.render('calendar', {layout: USE_LAYOUT, date: new Date(), allCalendarEvents: allCalendarEvents, user: this.session.user});
}));

app.use(_.get("/signin", function *(){
  ticket=this.request.query.ticket;
  var obj= yield auth.cas_login(ticket, SERVICE);
  this.session.user=obj.username;
  this.session.attributes=obj.attributes;
  var client = db();
  client.query("INSERT INTO users(netid) VALUES ($1);", [obj.username] )
  this.redirect('/');
}));

app.use(_.get("/logout", function *(){
  this.session = null;
  this.redirect('https://cas.byu.edu/cas/logout');
}));

app.use(_.get("/mkadmin",function *(){
  to_mk=this.request.query.user;
  auth.mkadmin(this.session.user, to_mk);
}));

socket.start(app);

socket.use(function*(){
  this.data._cookie = this.socket.handshake.headers.cookie;
})

socket.on('write message', function(title, msg){
  var client = db();
  client.query("INSERT INTO messages(title, username, message_body) VALUES ($1, $2, $3);", [title, 'netId' , msg]);
  app.io.emit('write message', msg, title);
});

socket.on('delete message', function(message_number){
  var client = db();
  client.query("DELETE FROM messages WHERE message_id = $1;", [message_number]);
  app.io.emit('delete message', message_number);
});

socket.on('calendar event', function(event) {
  var client = db();
  var cookieObject = JSON.parse(new Buffer(cookie.parse(event._cookie)['koa:sess'], 'base64').toString('utf8'));
  client.query('INSERT INTO calendar("user", "time", room, duration, title)VALUES ($1, $2, $3, $4, $5);', [cookieObject.user, event.time, event.room, event.duration, event.title]);
  app.io.emit("calendar event", event);
});

socket.on('delete calendar event', function(event) {
  var client = db();
  var cookieObject = JSON.parse(new Buffer(cookie.parse(event._cookie)['koa:sess'], 'base64').toString('utf8'));
  if (cookieObject.user === event.user) {
    client.query('DELETE FROM calendar WHERE room=$1 AND "time"=$2;', [event.room, event.time]);
    app.io.emit("delete calendar event", event);
  }
});

socket.on('write task', function(task){
  var client = db();

  client.transaction(function*(t) {
    var query = "INSERT INTO tasks(task, username, priority) VALUES ($1, $2, -1) RETURNING task_id";
    var result = yield t.queryOne(query, [task.text, 'netId']);
    app.io.emit('write task', result.task_id);
  }).catch(console.error);

});

socket.on('delete task', function(t_number){
  var client = db();
  console.log("\nTask text = " + t_number.text);
  client.query("DELETE FROM tasks WHERE task = $1;", [t_number.text]);
  app.io.emit('delete task', t_number);
});

socket.on('reorder tasks', function(newTaskOrder){
  var client = db();;
  newTaskOrder.forEach(function (arrayVal, arrayLocation)
  {
    client.query("update tasks set priority = $1 where task_id = $2", [arrayLocation,arrayVal]);
  })
  app.io.emit('reorder task', newTaskOrder);
});

module.exports = app.server;
