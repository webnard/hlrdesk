prom_spawn = require('prom-spawn');
const ENV = process.env;

function resetDB(callback) {
  // note that ENV.PGDATABASE is set by the .run-tests.sh
  prom_spawn('dropdb',ENV.PGDATABASE,'--if-exists')()
    .then(prom_spawn('createdb',ENV.PGDATABASE,'-T',ENV.TEMPLATE_DB))
    .then(callback);
}

module.exports = resetDB;
