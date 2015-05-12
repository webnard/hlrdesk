"use strict";

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

inventory.search = co.wrap(function* (text, username, params) {
  assert(yield auth.isAdmin(username), 'Only admins can search the database. No searching for ' + username);
  var items = [];
  var client = db();

  // TODO: This has a high cost; it may be beneficial enforce a limit on the
  // subquery that matches text where a large inventory and high volume of searches
  // are concerned

  // NOTE: the percent signs need to be concatenated for the $1 replacement to work
  var query = 'SELECT '+
    ' inv."call" as "call_number", inv."title", inv."quantity",' +
    '   array_agg(foo.copies_available) as copies_available' +
    ' FROM "inventory" as inv ' +
    ' LEFT JOIN ( SELECT copies_available, subq.call FROM ' +
    '   ( SELECT call, generate_series(1,quantity) AS copies_available FROM inventory) AS subq ' +
    '   WHERE subq.copies_available NOT IN ' +
    '     ( SELECT copy FROM checked_out WHERE checked_out.call=subq.call) ' +
    ' ) as foo ON foo.call = inv.call ' +
    ' WHERE TRUE AND (LOWER(inv."call") LIKE LOWER(\'%\' || $1 || \'%\')' +
    ' OR LOWER("title") LIKE LOWER(\'%\' || $1 || \'%\')) GROUP BY inv.call;';

  var result = yield client.query(query, [text]);

  // gets rid of null values for copies_available field
  result.rows.forEach(function(row) {
    row.copies_available = row.copies_available.filter(function(copy) {
      return copy !== null;
    });
  });
  return yield Promise.resolve(result.rows);
});

inventory.update = co.wrap(function*(user, call, details) {
  assert(yield auth.isAdmin(user), "User must be an administrator to update products.");
  var client = db();
  
  yield client.query("UPDATE inventory SET (call, quantity, title, checkout_period, is_reserve, is_duplicatable, on_hummedia, edited_by, date_edited, notes) = ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9) WHERE  call = $10;", 
  [details.newCall, details.quantity, details.title, details.checkLength, details.reserve, details.duplicatable, details.online, that.user, details.notes, details.origCall]);

  var amount;
  var title;
  var res;
  var dup;
  var hum;
  var allNotes = '';

  if(edited.origCall !== edited.newCall) {
    allNotes= "UPDATED CALL NUMBER = ["+ edited.newCall + "]. Previous call number was " + edited.origCall + ".";
  }
  if (edited.oldItem.quant != edited.quantity)
  {
    allNotes +="New quantity = ["+edited.quantity + "] was [" + edited.oldItem.quant + "] ";
    amount = edited.quantity;
  }
  if (edited.oldItem.titl != edited.title)
  {
    allNotes +="New title = ["+edited.title + "] was [" + edited.oldItem.titl + "] ";
    title = edited.title;
  }
  if (edited.oldItem.reserv != edited.reserve)
  {
    allNotes +="Reserve is now ["+edited.reserve + "] ";
    res = edited.reserve;
  }
  if (edited.oldItem.dup != edited.duplicatable)
  {
    allNotes +="Duplicatable is now [" + edited.duplicatable + "] ";
    dup = edited.duplicatable;
  }
  if (edited.oldItem.hum != edited.online)
  {
    allNotes += "'Is on Hummedia' option is now ["+edited.online + "]";
    hum = edited.online;
  }
  var c = edited.oldItem.notes;
  if (edited.oldItem.notes == null){c = '';}
  if (edited.notes != c)
  {
    allNotes +="Notes = ["+edited.notes + "] was [" + edited.oldItem.notes + "] ";
  }

  if (allNotes){//if nothing but call is changed, do nothing, otherwise will update
    // don't yield, because if this fails, well, eh, not a big deal.
    client.query("INSERT INTO item_history (call_number, type, who, title, date_changed, notes) VALUES ($1, 'Edit', $2, $3, CURRENT_TIMESTAMP, $4) ",
    [edited.newCall, that.user, edited.title, allNotes ])
  }

});

inventory.check_in = co.wrap(function*(call, patron, employee) {

  assert(yield inventory.exists(call), 'The item ' + call + ' does not exist');
  assert(yield auth.isAdmin(employee), employee + ' is not an admin and cannot check in ' + call + ' for ' + patron);

  // TODO: ensure that only employees can check items in
  var client = db();
  var count_query = 'SELECT call FROM checked_out ' +
    'WHERE ctid IN (SELECT ctid FROM ' +
    'checked_out WHERE call = $1 AND ' +
    'netid = $2 AND $3 in (SELECT netid FROM users WHERE netid = $3) ' +
    'ORDER BY due ASC LIMIT 1) LIMIT 1;';
  var count_result = yield client.query(count_query, [call, patron, employee]);

  assert(count_result.rows.length > 0, call + ' not checked out by ' + patron);

  var query = 'DELETE FROM checked_out WHERE ctid IN (SELECT ctid FROM ' +
    'checked_out WHERE call = $1 AND ' +
    'netid = $2 AND $3 in (SELECT netid FROM users WHERE netid = $3) ' +
    'ORDER BY due ASC LIMIT 1);';
  var result = yield client.query(query, [call, patron, employee]);

  // TODO: record this transaction in the database

  return yield Promise.resolve(true);
});

inventory.is_checked_out = co.wrap(function*(call, copy) {
  var query = 'SELECT COUNT(*) c FROM checked_out WHERE "call" = $1 AND ' +
    '"copy" = $2 LIMIT 1';
  var client = db();
  var result = yield client.query(query, [call, copy]);
  return yield Promise.resolve(Number(result.rows[0].c) >= 1);
});

inventory.check_out = co.wrap(function*(items, patron, employee) {
  assert(yield auth.isAdmin(employee), employee + " is not an admin.");
  assert(yield auth.check_id(patron), patron + " is not a valid user.");

  var client = db();
  try{
    client.nonQuery('BEGIN TRANSACTION');
    for(var i = 0; i<items.length; i++) {
      var item = items[i];
      var due = item.due;
      var call = item.call;
      var copy = item.copy;
      assert(new Date(due) > (new Date()), "Due date " + due + " is earlier than now.");
      var checked_out = yield inventory.is_checked_out(call, copy);
      assert(!checked_out, call + " (copy #" + copy + ") is already checked out");
      assert(yield inventory.exists(call), call + " doesn't exist; cannot rent");

      var q = 'INSERT INTO checked_out(call, copy, netid, attendant, due)' +
        'VALUES($1, $2, $3, $4, $5)';
        
      var notes ='Item checked out by ' + employee + ' due on ' + due.toString().substring(0,10);
      yield client.nonQuery("INSERT INTO item_history (call_number, type, who, date_changed, notes) VALUES ($1, 'Checkout', $2, CURRENT_TIMESTAMP, $3) ", [call, patron, notes ])

      var dueFmt = moment(due).format();
      yield client.nonQuery(q , [call, copy, patron, employee, dueFmt]);
    };
    client.nonQuery('COMMIT');
  }catch(e) {
    client.nonQuery('ROLLBACK');
    throw e;
  }
  return yield Promise.resolve(true);
});

Object.defineProperty(inventory, 'checked_out', {
  get: co.wrap(function*() {
    var client = db();
    var query = 'SELECT c.due, c.attendant, c.netid as owner, c.copy, c.extensions, i.title as name, i.call '+
                'FROM checked_out c JOIN inventory i ON c.call = i.call';
    var results = (yield client.query(query)).rows;

    var formatted = results.map(function(a) {
      a.due = moment(a.due).toDate();
      a.call_number = a.call;
      a.overdue = moment(a.due).isBefore(new Date());
      return a;
    });
    return yield Promise.resolve(formatted);
  })
});

module.exports = inventory;
