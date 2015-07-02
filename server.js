var
    express = require('express'),
    conf = require('./settings/environment.js')
;

// Init database.
require("./db/redis.init.js")(conf);

// Initialize vhosts.
global.server = express.createServer();
global.server
    .use(express.vhost('cdn.' + conf.domain, require('./apps/assetProvider/app.js')(conf)))
    .use(express.vhost('*.' + conf.domain, require('./apps/short/app.js')(conf)));


console.log('listen: cdn.' + conf.domain + ':' + conf.port);
console.log('listen: *.' + conf.domain + ':' + conf.port);
console.log('env: ' + conf.env);
global.server.listen(conf.port);










