//var pg = require('pg');
var pg = require('postgres-gen');
var defaults = {};
defaults.user = process.env.PGUSER;
defaults.password = process.env.PGPASS;
defaults.host = process.env.PGHOST;
defaults.port = process.env.PGPORT;
//module.exports = pg;
module.exports = function(){
  return pg(defaults);
};

