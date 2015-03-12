var redis = require('node-redis');

var defaults = {};
defaults.port = process.env.REDIS_PORT || 6379;
defaults.host = process.env.REDIS_IP || "127.0.0.1";

module.exports = function(){
  return redis.createClient(defaults);
};