var _ = require('koa-route')
var koa = require('koa')
var serve = require('koa-static')
var render = require('koa-ejs')
var path = require('path')

var app = koa();

var auth = require('./app_modules/auth')
var db = require('./app_modules/db')
const ENV = process.env;
const SERVICE = auth.service(ENV.HLRDESK_HOST, ENV.PORT, '/signin', !ENV.HLRDESK_DEV);
var USE_LAYOUT;

if(ENV.HLRDESK_DEV) {
  app.use(require('./app_modules/koa-sassy').Sassy);
}

app.keys = ['TODO MAKE ME AN ENV VARIABLE', 'I SHOULD NOT BE HARDCODED', 'MY DOG HAS NO NOSE', 'HOW DOES HE SMELL?', 'AWFUL'];

app.use(function * TODO_DELETE_THIS_FUNCTION(next) {
  // no, seriously, this should not exist beyond a day or two past
  // January 15, 2015.
  this.cookies.set('netId', 'prabbit', { signed: true });
  this.cookies.set('emailAddress', 'prabbitbyu@sharklasers.com', { signed: true });
  this.cookies.set('name', 'Peter Rabbit', { signed: true });
  yield next;
});

app.use(serve(path.join(__dirname, '..', 'public')));

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
  var layout;
  if(this.request.header['x-requested-with']=== 'XMLHttpRequest'){layout =false};
  var client = db();
  var all_messages = yield client.query("SELECT * FROM messages;"); //console.log(all_messages);
  yield this.render('msg', {layout: layout, all_messages: all_messages});
}));

app.use(_.get("/signin", function *(){
  ticket=this.request.query.ticket;
  var obj= yield auth.cas_login(ticket, SERVICE);
  // do something with obj.username
  this.redirect('/');
}));



console.log("Server running on port", ENV.PORT);
console.log("Development:", !!ENV.HLRDESK_DEV);
console.log("Hostname:", ENV.HLRDESK_HOST);

var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);

io.on('connection', function(socket){
  socket.on('write message', function(title, msg){
  console.log('Message title: ' +title + ' \n\tMessage Body: ' + msg);//testing feature only
  var client = db();
  client.query("INSERT INTO messages(title, username, message_body) VALUES ($1, $2, $3);", [title, 'netId' , msg]);
  io.emit('write message', msg, title);
});
});

io.on('connection', function(socket){
  socket.on('delete message', function(message_number){
  console.log('Deleted Message Number ' + message_number);//testing feature only
  var client = db();
  client.query("DELETE FROM messages WHERE message_id = $1;", [message_number]);
  io.emit('delete message', message_number);
});
});

server.listen(ENV.PORT)

