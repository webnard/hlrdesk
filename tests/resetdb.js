prom_spawn = require('prom-spawn');
const ENV = process.env;

function resetDB(callback) {
  // note that ENV.PGDATABASE is set by the .run-tests.sh file
  var killQuery = "SELECT pg_terminate_backend(pg_stat_activity.pid) " +
                  "FROM pg_stat_activity " +
                  "WHERE pg_stat_activity.datname='" + ENV.PGDATABASE + "' " +
                  "AND pid <> pg_backend_pid();";
  prom_spawn('psql', '-c', killQuery)()
    .then(prom_spawn('dropdb',ENV.PGDATABASE,'--if-exists'))
    .then(prom_spawn('createdb',ENV.PGDATABASE,'-T',ENV.TEMPLATE_DB))
    .then(callback);
}

module.exports = resetDB;
