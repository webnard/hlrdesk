//var pg = require('pg');
var pg = require('postgres-gen');

var defaults = {};
defaults.user = encodeURIComponent(process.env.PGUSER);
defaults.database = encodeURIComponent(process.env.PGDATABASE);
defaults.password = encodeURIComponent(process.env.PGPASS);
defaults.host = encodeURIComponent(process.env.PGHOST);
defaults.port = process.env.PGPORT;
defaults.poolSize = process.env.PGPOOLSIZE || 10;
defaults.pool = (process.env.PGPOOLSIZE === "0" ? false : 10);
//module.exports = pg;
module.exports = function(){
  return pg(process.env.DATABASE_URL || defaults);
};

