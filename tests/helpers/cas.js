var config = require('../../core/config1');

var cheerio     = require('cheerio'),
    querystring = require('querystring'),
    Q           = require('q'),
    co          = require('co'),
    request     = require('co-request'),
    https       = require('https');

function _getCASFieldsFromHTML(html) {
  var fields = {};
      $      = cheerio.load(html),

  $('textarea, input').each(function(){
    fields[$(this).attr('name')] = $(this).val();
  });
  return fields;
}

exports.getTicket = function * (username, password) {
  var deferred = Q.defer();
  co(function *(username, password) {
    var r = request.defaults({jar: true, followRedirect: false});

    //var url = config.cas.url + '?service=' + escape(config.localhost);
    var url = config.cas.url + '?service=' + config.localhost;
    
    var response = yield r.get(url);
    var fields = _getCASFieldsFromHTML(response.body);
    fields.username = username;
    fields.password = password;

    response = yield r.post(url, {form: fields});

    var url = response.headers.location;
    var t = 'ticket='; // TODO - not the easiest-to-read, or most foolproof, way of getting ticket
    var ticket = url.slice(url.indexOf(t)+t.length);
    return ticket;
  })(username, password, function(err, body){
    if(err) console.error(err);
    deferred.resolve(body);
  });
  return deferred.promise;
};
