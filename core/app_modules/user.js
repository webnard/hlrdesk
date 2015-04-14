'use strict';

var db = require('./db');
var auth = require('./auth');

module.exports = {
  // details is a key->value object corresponding
  // with columns in the user database, so long as these are whitelisted (see code)
  // create_if_null (boolean) will create the user if they don't exist
  update: co.wrap(function*(netid, details, create_if_null) {
    assert(typeof netid === 'string', 'Net ID must be a string.');

    var details_whitelist = [
      'email',
      'telephone'
    ];
    var client = db();
    var updateQuery = '';
    var values = [];

    details_whitelist.forEach(function(field, index) {
      if(details.hasOwnProperty(field)) {
        updateQuery = '"' + field + '" = $' + index+1;
        values.push(details[field]);
      }
    });

    if(!yield auth.isUser(netid)) {
      yield client.nonQuery('INSERT INTO users(netid) VALUES($1)', [netid]);
    }
    if(updateQuery === '') {
      if(typeof details === 'object' && Object.keys(details).length > 0) {
        var keys = Object.keys(details).join(', ');
        console.warn('The following update keys were ignored for ' + netid + ', because ' +
        'they are not whitelisted: ' + keys);
      }
      return yield Promise.resolve();
    }

    var fullQuery = 'UPDATE users SET ' + updateQuery +
      ' WHERE netid = $' + (values.length+1) + ';';

    var fullValues = values.push(netid);
    var recordsAffected = yield client.nonQuery(fullQuery, fullValues);

    assert(recordsAffected, 'Could not update information for ' + netid);
    return yield Promise.resolve();
  });
};
