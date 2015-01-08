//Gets developers personal config Information
var cas = require('byu-cas');

module.exports = {
  cas_login: function(ticket, service) {
    return cas.validate(ticket, service);
  },
  // tells us whether or not this host has access to CAS' attributes for BYU's
  // NetIDs. Checks if the port is 443 and the host is on BYU's domain.
  has_cas_access: function(host, port) {
    return (port == 443 && host.match(/\.byu\.edu$/) !== null);
  },

  // retrieves a service for use when logging in through CAS
  service: function(host, port, endpoint, no_proxy) {
    if(!no_proxy && !this.has_cas_access(host, port)) {
      var redirect = (port === 443 ? 'https' : 'http') + '://' + host + ':' + port + endpoint;
      return "https://hlrdev.byu.edu/redirect/" + redirect;
    }
    // assume if not in development the host is an ssl-enabled .byu.edu domain
    // note that cas does not allow specified ports in service URLs, even if the port is 443
    return 'https://' + host + endpoint;
  }
};
