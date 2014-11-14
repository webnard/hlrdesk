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

function _readStreamData(stream) {
  var deferred = Q.defer();
  var data = '';

  stream.on('data', function(chunk) {
    data += chunk;
  });
  stream.on('end', function() {
    deferred.resolve(data);
  });

  return deferred.promise;
}

exports.getTicket = function(username, password) {
  var deferred = Q.defer();

  var url = config.cas.url + '?service=' + escape(config.localhost);
  
  https.get(url, function(response) {
    response.setEncoding('utf-8');

    _readStreamData(response).then(function(html) {
      var fields = _getCASFieldsFromHTML(html);
      fields.username = username;
      fields.password = password;

      var opts = {
        hostname: config.cas.host,
        port: config.cas.port,
        path: config.cas.path,
        method: 'POST'
      };

      var req = https.request(opts, function(res){
        res.on('data', function(chunk){
          console.log("HEY: ", chunk);
        });
        deferred.resolve(fields);
      });

      req.write(querystring.stringify(fields));
      req.end();
    });
  });
  return deferred.promise;
}
