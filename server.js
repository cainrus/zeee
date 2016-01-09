var
    express = require('express'),
    conf = require('./settings/environment.js')
;

// Init database.
require("./db/redis.init.js")(conf);

// Initialize vhosts.
global.server = express.createServer();
var assetProvider = require('./apps/assetProvider/app.js')(conf);
var shortenerApp = require('./apps/short/app.js')(conf);
global.server
    .use(express.vhost('cdn.' + conf.domain, assetProvider))
    .use(express.vhost('*.' + conf.domain, shortenerApp))
    .use(express.vhost(conf.domain, shortenerApp));

console.log('listen: cdn.' + conf.domain + ':' + conf.port);
console.log('listen: *.' + conf.domain + ':' + conf.port);
console.log('env: ' + conf.env);
global.server.listen(conf.port);










