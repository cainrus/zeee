// db.js
var client, redis = require('redis');
if (process.env.NODE_ENV !== 'production') {
	client = redis.createClient();
} else {
	var redisURL = require('url').parse(process.env.REDISCLOUD_URL);
	client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
	client.auth(redisURL.auth.split(":")[1], function(err){
		if (err) { throw err; }
		else { console.log('Redis db auth state: success.'); }
	});
}

module.exports = client;
