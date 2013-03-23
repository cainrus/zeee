console.log('starging app.');
var
    express = require('express'),
    connect = require('connect'),
    counter = require('./classes/counter.js'),
    common = require('./public/js/common.js'),
    conf = require('./settings/environment.js');

//var socketio = require('./classes/socket.js')(conf);

//global.everyauth = require('everyauth');

console.log('starging app db.');
var db = require("./classes/redisConnection.js");
db.on("error", function (err) {
  console.log("redis error: " + err);
  process.exit(1);
});

db.on('connect', function() {
    console.log("Redis db is inited.");
    dbDependedInit();
});

// init redis dependent stuff
var dbDependedInit = require('underscore').once(function() {
    console.log('initing urlCounter');
    global.urlCounter = new counter({name: 'url', client: db});
	
	console.log('initing vhosts');
    var site_vhosts = [];
    site_vhosts.push(express.vhost('cdn.' + conf.domain, require('./apps/assetProvider/app.js')));
    site_vhosts.push(express.vhost('*.' + conf.domain, require('./apps/short/app.js')));
    vhost = express.createServer.apply(this, site_vhosts);
    vhost .listen(conf.port);
	console.log('express is listening port: '+conf.port);
});







