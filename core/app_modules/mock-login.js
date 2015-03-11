var thunkify = require('thunkify'),
    readFile = thunkify(require('fs').readFile),
    path     = require('path'),
    auth     = require('./auth');

module.exports = function(app) {
  app.use(function*(next) {
    if(this.request.path === '/logmein') {
      var fname = path.basename(this.query.as) + '.json';
      var fpath = path.join(__dirname,'..','..','tests','sessions',fname); 
      var data = yield readFile(fpath);
      auth.login(this, JSON.parse(data));
      this.status = 200;
    }
    yield next;
  });
}
