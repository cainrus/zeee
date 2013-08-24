var
    express = require('express'),
    connect = require('connect'),
    conf = require('./settings/environment.js'),
    db = require("./db/redis.init.js")(conf)
;

//var socketio = require('./classes/socket.js')(conf);
//global.everyauth = require('everyauth');

// Initialize vhosts.
server = express.createServer();
server
    .use(express.vhost('cdn.' + conf.domain, require('./apps/assetProvider/app.js')(conf)))
    .use(express.vhost('*.' + conf.domain, require('./apps/short/app.js')(conf)))
;


console.log('listen: cdn.' + conf.domain + ':' + conf.port);
console.log('listen: *.' + conf.domain + ':' + conf.port);
console.log('mode: ' + process.env.NODE_ENV);
server.listen(conf.port);










