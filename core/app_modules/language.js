var co = require('co');
var db = require('./db');

module.exports = {
  create: co.wrap(function*(code, language) {

  }),
  update: co.wrap(function*(code, new_code, new_language) {

  }),
  // delete is a reserved word
  remove: co.wrap(function*(code) {

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
