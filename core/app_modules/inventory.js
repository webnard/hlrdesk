var moment = require('moment');
var db = require('./db');
var co = require('co');

var inventory = {};

inventory.exists = co.wrap(function*(call) {
  var client = db();
  var count = 'SELECT call FROM inventory WHERE call = $1 LIMIT 1';
  var result = yield client.query(count, [call]);
  return yield Promise.resolve(result.rows.length > 0);
});

inventory.check_in = co.wrap(function*(call, patron, employee) {

  if(!(yield inventory.exists(call))) {
    var msg = 'The item ' + call + ' does not exist and cannot be checked in';
    throw new InvalidItemError(msg);
  }

  // TODO: ensure that only employees can check items in
  var client = db();
  var count_query = 'SELECT call FROM checked_out ' +
    'WHERE ctid IN (SELECT ctid FROM ' +
    'checked_out WHERE call = $1 AND ' +
    'netid = $2 AND $3 in (SELECT netid FROM users WHERE netid = $3) ' +
    'ORDER BY due ASC LIMIT 1) LIMIT 1;';
  var result = yield client.query(count_query, [call, patron, employee]);

  if(result.rows.length <= 0) {
    var msg = 'The call number ' + call + ' is not checked out by ' + patron;
    throw new NotCheckedOutError(msg);
  }

  var query = 'DELETE FROM checked_out WHERE ctid IN (SELECT ctid FROM ' +
    'checked_out WHERE call = $1 AND ' +
    'netid = $2 AND $3 in (SELECT netid FROM users WHERE netid = $3) ' +
    'ORDER BY due ASC LIMIT 1);';
  var result = yield client.query(query, [call, patron, employee]);

  // TODO: record this transaction in the database

  return yield Promise.resolve(true);
});

inventory.check_out = co.wrap(function*(call, patron, employee) {

});

Object.defineProperty(inventory, 'checked_out', {
  get: getCheckedOut
});

module.exports = inventory;

function getCheckedOut() {
  return (co.wrap(function*() {
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
  })()).then(
    function passthru(a){return Promise.resolve(a)},
    function error(err) { console.error(err.stack); }
  );
}

// ERRORS

inventory.InvalidItemError = InvalidItemError;
inventory.NotCheckedOutError = NotCheckedOutError;

function InvalidItemError(message) {
  this.message = message;
  this.stack = Error().stack;
};
InvalidItemError.prototype = Object.create(Error.prototype);
InvalidItemError.prototype.name = 'InvalidItem';

function NotCheckedOutError(message) {
  this.message = message;
  this.stack = Error().stack;
};
NotCheckedOutError.prototype = Object.create(Error.prototype);
NotCheckedOutError.prototype.name = 'NotCheckedOutError';
