//Gets developers personal config Information
var config=require('../config1')

var CAS = require('fmontmasson-xcas');

var Q    = require('q');

module.exports = {
  cas_login: function(ticket, service) {
    var cas = new CAS({
        base_url: 'https://cas.byu.edu/cas/',
        service: service,
        version: 2.0
    });

    var deferred = Q.defer();
    var obj;
    if (ticket){
      cas.validate(ticket, function(err, status, username) {
        if (err) {
          // Handle the error
          obj=({status: false, username: null});
        } else {
          // Log the user in
          obj=({status: status, username: username});
        }
        deferred.resolve(obj)
      });
    }
    return deferred.promise;
  }
};
