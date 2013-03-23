// db.js
var redis = require('redis');
var redisURL = require('url').parse(process.env.REDISCLOUD_URL);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1], function(err){
	if (err) { throw err; }
	else { console.log('Redis db auth state: success.'); }
});

module.exports = client;
