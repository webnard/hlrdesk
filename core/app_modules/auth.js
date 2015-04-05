//Gets developers personal config Information
var cas = require('byu-cas');
var db = require('./db');
var co = require ('co');
var uuid = require('node-uuid');
var redis = require('./redis');

check_id = co.wrap(function*(netid){
  var client = db();
  var is_user = yield client.query("SELECT CASE WHEN EXISTS (SELECT * FROM users WHERE netid = $1) THEN 'TRUE' ELSE 'FALSE' end;", [netid])
  return yield Promise.resolve(is_user.rows[0].case == "TRUE");
})

check_admin = co.wrap(function*(user){
  var client = db();
  var is_user = yield client.query("SELECT CASE WHEN EXISTS (SELECT * FROM users WHERE netid = $1 AND admin = 't') THEN 'TRUE' ELSE 'FALSE' end;", [user])
  console.warn("The function 'check_admin' is deprecated. Use 'isAdmin' instead.");
  return yield Promise.resolve(is_user.rows[0].case == "TRUE");
})

isAdmin = co.wrap(function*(user){
  var client = db();
  var is_user = yield client.query("SELECT CASE WHEN EXISTS (SELECT * FROM users WHERE netid = $1 AND admin = 't') THEN 'TRUE' ELSE 'FALSE' end;", [user])
  return yield Promise.resolve(is_user.rows[0].case == "TRUE");
})

module.exports = {
  cas_login: function(ticket, service) {
    return cas.validate(ticket, service);
  },
  // tells us whether or not this host has access to CAS' attributes for BYU's
  // NetIDs. Checks if the port is 443 and the host is on BYU's domain.
  has_cas_access: function(host, port) {
    return (port == 443 && host.match(/\.byu\.edu$/) !== null);
  },

  login: function(ctx, obj) {
    var client = db();
    var redisClient = redis();
    var token = uuid.v4();
    ctx.session.user=obj.username;
    ctx.session.token=token;
    ctx.session.attributes=obj.attributes;

    /**
     * NB: cookie is set only for testing purposes.
     * Tokens should be taken either from session storage
     * (server side) or window.HLRDESK.token (client side).
     * Setting it here in the cookie is an easy way to extract
     * it when needing to test sockets server-side, because it
     * can be taken right from the cookie. Ideally, this line
     * wouldn't be necessary, and it may very well not be if
     * someone can get the tests to otherwise work.
     */
    ctx.cookies.set('token', token, {maxAge: 0});

    redisClient.sadd([token, obj.username]);
    redisClient.expire(token, 43200);
    client.query("INSERT INTO users(netid) VALUES ($1);", [obj.username] )
  },

  getUser: co.wrap(function* (token) {
    return new Promise(function(resolve, reject) {
      redis().smembers(token, function(err, reply){ 
        if(err) { reject(err); }
        resolve(reply.toString());
      });
    });
  }),

  // retrieves a service for use when logging in through CAS
  service: function(host, port, endpoint, no_proxy) {
    if(!no_proxy && !this.has_cas_access(host, port)) {
      var redirect = (port === 443 ? 'https' : 'http') + '://' + host + ':' + port + endpoint;
      return "https://hlrdev.byu.edu/redirect/" + redirect;
    }
    // assume if not in development the host is an ssl-enabled .byu.edu domain
    // note that cas does not allow specified ports in service URLs, even if the port is 443
    return 'https://' + host + endpoint;
  },

  check_admin: check_admin,
  isAdmin: isAdmin,

  check_id: check_id,

  mkadmin: co.wrap(function*(user, netid) {
    var client = db();
    var is_user = yield check_id(netid);
    var user_is_admin = yield check_admin(user);
    if (is_user && user_is_admin){
      client.query("UPDATE users SET admin='TRUE' WHERE netid = $1", [netid])
      return yield Promise.resolve(true);
    }
    else {
      return yield Promise.resolve(false);
    }
  })
};
