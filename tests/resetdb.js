var prom_spawn = require('prom-spawn'),
    crypto     = require('crypto');

const ENV = process.env;

function resetDB(callback) {
  // DB_PREFIX is specified in the .run-tests.sh file
  var db = ENV.TEST_DB_PREFIX + crypto.randomBytes(8).toString('hex');
  ENV.PGDATABASE = db;

  prom_spawn('createdb',ENV.PGDATABASE,'-T',ENV.TEMPLATE_DB)()
     // prom_spawn resolves an empty string, we want to pass nothing
     // because the done() method in mocha must be called either with
     // no arguments or with an Error as the only argument
    .then(function() {callback()});
}

module.exports = resetDB;
