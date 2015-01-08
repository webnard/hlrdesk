var _ = require('koa-route')
var koa = require('koa') //adds koa
var serve = require('koa-static')
var render = require('koa-ejs')
var path = require('path')

var app = koa();

var auth = require('auth')

const ENV = process.env;
const SERVICE = auth.service(ENV.HLRDESK_HOST, ENV.PORT, '/signin', !ENV.HLRDESK_DEV);

if(ENV.HLRDESK_DEV) {
  app.use(require('koa-sassy').Sassy);
}

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

app.use(_.get("/", function *() {
  yield this.render('admin_index', {layout: false});
}));

app.use(_.get("/signin", function *(){
  ticket=this.request.query.ticket;
  var obj= yield auth.cas_login(ticket, SERVICE);
  // do something with obj.username
  this.redirect('/');
}));

app.listen(ENV.PORT)

console.log("Server running on port", ENV.PORT);
console.log("Development:", !!ENV.HLRDESK_DEV);
console.log("Hostname:", ENV.HLRDESK_HOST);
