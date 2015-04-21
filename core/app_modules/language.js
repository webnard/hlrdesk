var co = require('co');
var db = require('./db');

module.exports = {
  create: co.wrap(function*(code, name) {
    yield db().nonQuery('INSERT INTO LANGUAGES(code, name) VALUES($1, $2)', [code, name]);
    return yield Promise.resolve(true);
  }),
  update: co.wrap(function*(code, new_code, new_name) {
    yield db().nonQuery('UPDATE LANGUAGES SET code=$2, name=$3 WHERE code=$1', [code, new_code, new_name]);
    return yield Promise.resolve(true);
  }),
  // delete is a reserved word, so I'm using 'remove'
  remove: co.wrap(function*(code) {
    var client = db();
    var rowsAffected = yield client.nonQuery('DELETE FROM languages WHERE code=$1', [code]);
    if(rowsAffected < 1) {
      return yield Promise.reject('Could not delete language code ' + code);
    }
    return yield Promise.resolve(true);
  })
}

Object.defineProperty(module.exports, 'list', {
  get: co.wrap(function*() {
    var client = db();
    var query = 'SELECT code, name FROM languages;';
    var results = yield client.query(query);
    return yield Promise.resolve(results.rows);
  })
});
