var
    express = require('express'),
    connect = require('connect'),
    db = require("./classes/redisConnection.js"),
    counter = require('./classes/counter.js'),
    common = require('./public/js/common.js'),
    conf = require('./settings/environment.js');

//var socketio = require('./classes/socket.js')(conf);

//global.everyauth = require('everyauth');

db.on("error", function (err) {
  console.log("redis error: " + err);
  process.exit(1);
});

// init redis dependent stuff
var dbDependedInit = require('underscore').once(function() {
    global.urlCounter = new counter({name: 'url', client: db});
    var site_vhosts = [];

    site_vhosts.push(express.vhost('cdn.' + conf.domain, require('./apps/assetProvider/app.js')));
    site_vhosts.push(express.vhost('*.' + conf.domain, require('./apps/short/app.js')));

    vhost = express.createServer.apply(this, site_vhosts);
    vhost .listen(conf.port);
});

db.on('connect', function() {
    dbDependedInit();
});








