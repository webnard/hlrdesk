//Gets developers personal config Information
var cas = require('byu-cas');

module.exports = {
  cas_login: function(ticket, service) {
    return cas.validate(ticket, service);
  }
};
