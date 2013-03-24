var
    express = require('express'),
    connect = require('connect'),
    db = require("./db/redis.init.js"),
    common = require('./public/js/common.js'),
    conf = require('./settings/environment.js');

//var socketio = require('./classes/socket.js')(conf);
//global.everyauth = require('everyauth');

// Initialize vhosts.
vhost = express.createServer.apply(this, [
    express.vhost('cdn.' + conf.domain, require('./apps/assetProvider/app.js')),
    express.vhost('*.' + conf.domain, require('./apps/short/app.js'))
]);

vhost.listen(conf.port);










