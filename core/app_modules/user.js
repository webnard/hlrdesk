'use strict';

var db = require('./db');
var auth = require('./auth');
var co = require('co');
var assert = require('assert');
var ldap = require('ldap');
var extend = require('extend');

var user = {
  // details is a key->value object corresponding
  // with columns in the user database, so long as these are whitelisted (see code)
  // create_if_null (boolean) will create the user if they don't exist
  update: co.wrap(function*(netid, details, create_if_null) {
    assert(typeof netid === 'string', 'Net ID must be a string.');
    assert(netid !== '', 'Net ID cannot be empty');

    var details_whitelist = [
      'email',
      'telephone',
      'name'
    ];
    var client = db();
    var updateQuery = '';
    var values = [];

    details_whitelist.forEach(function(field, index) {
      if(details.hasOwnProperty(field)) {
        if(updateQuery) {
          updateQuery += ', ';
        }
        updateQuery += '"' + field + '" = $' + (values.length+1);
        values.push(details[field]);
      }
    });

    if(!(yield auth.check_id(netid))) {
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

    values.push(netid);
    var recordsAffected = yield client.nonQuery(fullQuery, values);

    assert(recordsAffected, 'Could not update information for ' + netid);
    return yield Promise.resolve();
  }),

  get: co.wrap(function*(netid) {
    var client = db();
    var query = "SELECT * FROM users WHERE netid in ?;";

    var argArray = [];
    for(let i = 0; i<arguments.length; i++) {
      argArray.push(arguments[i]);
    }
    var rows = (yield client.query(query, [argArray])).rows;
    var data = {};

    rows.forEach(function(row) {
      data[row.netid] = row;
    });

    return yield Promise.resolve(data);
  }),

  contactInfo: co.wrap(function*(netid_1, netid_2, netid_n) {
    // retrieves contact information from a list of netIDs,
    // giving preference to what is in the database
    // and then turning to the ldap server for additional information
    var ldapData = yield user.ldapInfo.apply(this, arguments);
    var localData = yield user.get.apply(this, arguments);
    var data = {};

    Object.keys(ldapData).forEach(function(netid) {
      data[netid] = ldapData[netid];
      var li = localData[netid];
      var ri = ldapData[netid];

      if(!ri && !li) {
        // should never happen
        throw new Error("No information found for " + netid);
      }

      if(!ri) {
        data[netid] = li;
        data[netid].name = 'Unknown';
      }

      if(!li) {
        data[netid] = ri;
        data[netid].name = ri.cn || '';
        data[netid].telephone = ri.telephoneNumber || ri.homePhone || '';
        data[netid].email = ri.mail || '';
      }

      data[netid] = ri;
      data[netid].name = ri.cn || '';
      data[netid].telephone = li.telephone || ri.telephoneNumber || ri.homePhone || '';
      data[netid].email = li.email || ri.mail || '';
    });

    return yield Promise.resolve(data);

  }),

  // accepts any number of NetIDs as arguments
  ldapInfo: co.wrap(function*(netid) {
    var data = {};

    if(!arguments.length) {
      throw new Error("No arguments passed.");
    }

    for(let i = 0; i<arguments.length; i++) {
      if(arguments[i].match(/[^a-z0-9]/i)) {
        throw new Error("Invalid NetID: " + arguments[i]);
      }
      data[arguments[i]] = {};
    };

    return new Promise(function(resolve, reject) {

      var client = ldap.createClient({
        url: "ldaps://ldap.byu.edu",
        strictDN: false,
        timeout: false,
        tlsOptions: {rejectUnauthorized: true}
      });

      client.bind('o=byu.edu', '', function(err) {
        if(err) {
          reject(err);
          throw err;
        }

        var filter = '';

        Object.keys(data).forEach(function(netid) {
          filter += '(uid=' + netid + ')';
        });
        filter = '(|' + filter + ')';

        var req = {
          scope: 'sub',
          filter: filter
        };

        client.search('o=byu.edu', req, function(err, search) {
          if(err) {
            reject(err);
            throw err;
          }

          search.on('searchEntry', function(entry) {
            data[entry.object.uid] = extend(data[entry.object.uid], entry.object);
          });

          search.on('end', function(entry) {
            if(entry.status !== 0) {
              reject(new Error('connection ended with status code ' + entry.status));
            }
            resolve(data);
          });

          search.on('error', function(err) {
            reject(err);
          });

        });
      });
    });
  })
};
module.exports = user;
