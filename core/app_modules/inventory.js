var moment = require('moment');
var db = require('./db');
var co = require('co');

var inventory = {};

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
