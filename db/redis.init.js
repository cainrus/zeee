module.exports = function (conf) {
    'use strict';

    var client = require('./redisConnection')(conf);
    client.on('connect', function () {
        console.log("Redis db is connected.");
    });
    client.on("error", function (err) {
        console.error("Redis db error: " + err);
        process.exit(1);
    });

    return client;
};