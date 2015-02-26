var co = require('co'),
    db = require('./db');

module.exports = {
  exists: co.wrap(function*(netid) {
    var client = db();
    console.log(netid);
    var is_user = yield client.query("SELECT CASE WHEN EXISTS (SELECT * FROM users WHERE netid = $1) THEN 'TRUE' ELSE 'FALSE' end;", [netid])
    return yield Promise.resolve(is_user.rows[0].case == "TRUE");
  }),
  update: co.wrap(function*(netid, properties) {
    return yield Promise.resolve(true);
  })
}
