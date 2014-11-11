var _ = require('koa-route')
var koa = require('koa') //adds koa

global.config=require('./config')

var app = koa();

var auth = require('./app_modules/auth')

app.use(_.get("/signin", function *(){
  ticket=this.request.query.ticket;
  var obj= yield auth.cas_login(ticket);
  if (obj){
    if (obj.status==true){
      this.body="Hello World";
    }
    else{
      this.body="There seems to have been a problem. Please try again.";
    }
  }
}));

app.listen(8080)
