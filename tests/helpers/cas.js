var config = require('../../core/config1');

var cheerio     = require('cheerio'),
    querystring = require('querystring'),
    Q           = require('q'),
    request     = require('request'),
    https       = require('https');

function _getCASFieldsFromHTML(html) {
  var fields = {};
      $      = cheerio.load(html),

  $('textarea, input').each(function(){
    fields[$(this).attr('name')] = $(this).val();
  });
  return fields;
}

exports.getTicket = function(username, password) {
  var r = request.defaults({jar: true, followRedirect: false});

  var deferred = Q.defer();

  //var url = config.cas.url + '?service=' + escape(config.localhost);
  var url = config.cas.url + '?service=' + config.localhost;
  
  r.get(url, function(error, response, body) {
    var fields = _getCASFieldsFromHTML(body);
    fields.username = username;
    fields.password = password;

    r.post(url, {form: fields}, function(error, response, body){
      var url = response.headers.location;
      var t = 'ticket='; // TODO - not the easiest-to-read, or most foolproof, way of getting ticket
      var ticket = url.slice(url.indexOf(t)+t.length);
      deferred.resolve(ticket);
    });
  });
  return deferred.promise;
}
