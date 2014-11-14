var config = require('../../core/config1');

var cheerio = require('cheerio'),
    q = require('q'),
    Promise = require('bluebird'),
    https      = require('https');

function _getCASFieldsFromHTML(html) {
  var fields = {};
      $      = cheerio.load(html),

  $('textarea, input').each(function(){
    fields[$(this).attr('name')] = $(this).val();
  });
  return fields;
}

exports.getTicket = function(username, password) {
  return new Promise(function(resolve, reject) {
    var url = config.cas_url + '?service=' + escape(config.localhost);
    
    https.get(url, function(response) {
      response.setEncoding('utf-8');
      var html = '';

      response.on('data', function(chunk) {
        html += chunk;
      });

      response.on('end', function () {
        var fields = _getCASFieldsFromHTML(html);
        fields.username = username;
        fields.password = password;
        resolve(fields);
      });
    });
  });
}
