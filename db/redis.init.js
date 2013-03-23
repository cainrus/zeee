var client = require('./redisConnection');
client.on('connect', function() {
    console.log("Redis db is connected.");
});
client.on("error", function (err) {
  console.error("Redis db error: " + err);
  process.exit(1);
});

module.exports = client;