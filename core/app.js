var _ = require('koa-route')
var koa = require('koa')
var serve = require('koa-static')
var render = require('koa-ejs')
var path = require('path')

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
  if (!this.session.user && this.request.path!='/signin'){
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
  var layout;
  if(this.request.header['x-requested-with']=== 'XMLHttpRequest'){layout =false};
  var client = db();
  var all_messages = yield client.query("SELECT * FROM messages;"); //console.log(all_messages);
  yield this.render('msg', {layout: layout, all_messages: all_messages});
}));

app.use(_.get("/signin", function *(){
  ticket=this.request.query.ticket;
  var obj= yield auth.cas_login(ticket, SERVICE);
  this.session.user=obj.username;
  this.session.attributes=obj.attributes;
  this.redirect('/');
}));

app.use(_.get("/logout", function *(){
  this.session = null;
  this.redirect('https://cas.byu.edu/cas/logout');
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

