// db.js
var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

/*
var environmentFile = '/home/dotcloud/environment.json';
var environment = JSON.parse(require('fs').readFileSync(environmentFile));
var redishost = environment['DOTCLOUD_DATA_REDIS_HOST'];
var redisport = environment['DOTCLOUD_DATA_REDIS_PORT'];
var redispass = environment['DOTCLOUD_DATA_REDIS_PASSWORD'];
var client = redis.createClient(redisport, redishost);
client.auth(redispass);
*/

module.exports = client;
