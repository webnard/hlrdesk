var moment = require('moment');
var db = require('./db');
var co = require('co');
var auth = require('./auth');
var assert = require('assert');

var inventory = {};

inventory.exists = co.wrap(function*(call) {
  var client = db();
  var count = 'SELECT call FROM inventory WHERE call = $1 LIMIT 1';
  var result = yield client.query(count, [call]);
  return yield Promise.resolve(result.rows.length > 0);
});

inventory.search = co.wrap(function* (text) {
  var items = [];
  var client = db();

  // NOTE: the percent signs need to be concatenated for the $1 replacement to work
  var query = 'SELECT "call" as "call_number", "title", "quantity" FROM "inventory" ' +
    ' WHERE LOWER("call") LIKE LOWER(\'%\' || $1 || \'%\')' +
    ' OR LOWER("title") LIKE LOWER(\'%\' || $1 || \'%\');';

  var result = yield client.query(query, [text]);
  return yield Promise.resolve(result.rows);
});

inventory.check_in = co.wrap(function*(call, patron, employee) {

  assert(yield inventory.exists(call), 'The item ' + call + ' does not exist');

  // TODO: ensure that only employees can check items in
  var client = db();
  var count_query = 'SELECT call FROM checked_out ' +
    'WHERE ctid IN (SELECT ctid FROM ' +
    'checked_out WHERE call = $1 AND ' +
    'netid = $2 AND $3 in (SELECT netid FROM users WHERE netid = $3) ' +
    'ORDER BY due ASC LIMIT 1) LIMIT 1;';
  var result = yield client.query(count_query, [call, patron, employee]);

  assert(result.rows.length > 0, call + ' not checked out by ' + patron);

  var query = 'DELETE FROM checked_out WHERE ctid IN (SELECT ctid FROM ' +
    'checked_out WHERE call = $1 AND ' +
    'netid = $2 AND $3 in (SELECT netid FROM users WHERE netid = $3) ' +
    'ORDER BY due ASC LIMIT 1);';
  var result = yield client.query(query, [call, patron, employee]);

  // TODO: record this transaction in the database

  return yield Promise.resolve(true);
});

inventory.check_out = co.wrap(function*(call, patron, employee, due) {

  assert(due > (new Date()), "Due date " + due + " is earlier than now.");
  assert(yield auth.check_admin(employee), employee + " is not an admin.");
  assert(yield auth.check_id(patron), patron + " is not a valid user.");
  assert(yield inventory.exists(call), call + " doesn't exist; cannot rent");

  var client = db();
  var copy = (yield client.query('SELECT COUNT(*)+1 c FROM checked_out WHERE call = $1',
    [call])).rows[0].c;

  var q = 'INSERT INTO checked_out(call, copy, netid, attendant, due)' +
    'VALUES($1, $2, $3, $4, $5)';
  yield client.query(q , [call, copy, patron, employee, due]);

  return yield Promise.resolve(true);
});

Object.defineProperty(inventory, 'checked_out', {
  get: co.wrap(function*() {
    var client = db();
    var query = 'SELECT c.due, c.attendant, c.netid as owner, c.copy, c.extensions, i.volume, i.title as name, i.call '+
                'FROM checked_out c JOIN inventory i ON c.call = i.call';
    var results = (yield client.query(query)).rows;

    var formatted = results.map(function(a) {
      a.due = moment(a.due).toDate();
      a.call_number = a.call;
      a.overdue = moment(a.due).isBefore(new Date);
      return a;
    });
    return yield Promise.resolve(formatted);
  })
});

module.exports = inventory;
