prom_spawn = require('prom-spawn');
const ENV = process.env;
const DEFAULT_MAX_ATTEMPTS = 3;

function resetDB(callback, attemptNumber, maxAttempts) {
  var attemptNumber = attemptNumber || 1,
      maxAttempts = maxAttempts || DEFAULT_MAX_ATTEMPTS;

  if(attemptNumber > maxAttempts) {
    throw new Error("Could not drop database. After " + attemptNumber +
      " attempts, database '" + ENV.PGDATABASE + "' is still in use.");
  }

  // note that ENV.PGDATABASE is set by the .run-tests.sh file
  var countQ = "SELECT COUNT(pg_stat_activity.pid) " +
               "FROM pg_stat_activity " +
               "WHERE pg_stat_activity.datname='" + ENV.PGDATABASE + "' " +
               "AND pid <> pg_backend_pid();";

  prom_spawn('psql', '-Atqc', countQ)()
    .then(function(count){
      if(Number(count) > 0) {
        console.error("Database still in use, trying again to remove");
        resetDB(callback, attemptNumber+1, maxAttempts);
      }
      else
      {
        doDrop();
      }
    });

  function doDrop() {
    prom_spawn('dropdb',ENV.PGDATABASE,'--if-exists')()
      .then(prom_spawn('createdb',ENV.PGDATABASE,'-T',ENV.TEMPLATE_DB))
       // prom_spawn resolves an empty string, we want to pass nothing
       // because the done() method in mocha must be called either with
       // no arguments or with an Error as the only argument
      .then(function() {callback()});
  }
}

module.exports = resetDB;
