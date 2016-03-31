var co = require('co');
var db = require('./db');

module.exports = {
  remove: co.wrap(function*(media) {
    var client = db();
    var query = 'DELETE FROM media WHERE medium = $1';
    var results = yield client.nonQuery(query, [media]);

    // True or False, depending
    return yield Promise.resolve(!!results);
  }),

  add: co.wrap(function*(media) {
    var client = db();
    var query = 'INSERT INTO media(medium) VALUES($1)';
    var results = yield client.nonQuery(query, [media]);

    // True or False, depending
    return yield Promise.resolve(!!results);
  })
};

Object.defineProperty(module.exports, 'list', {
  get: co.wrap(function*() {
    var client = db();
    var query = 'SELECT medium FROM media ORDER BY medium ASC;';
    var results = yield client.query(query);
    var data = results.rows.map(function(r) {
      return r.medium;
    });
    return yield Promise.resolve(data);
  })
});
