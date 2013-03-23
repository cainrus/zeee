var conf = {};

process.env.NODE_ENV = 'production';

//var environmentFile = '/home/dotcloud/environment.json';
//var environment = JSON.parse(require('fs').readFileSync(environmentFile));
conf.domain    = 'ze.ee';
conf.subdomain = 'www';
conf.port      = process.env.PORT || 5000;
conf.outerPort = 80;
conf.protocol  = 'http://';
conf.rootDir   = __dirname.replace(/\/\w+$/, '');
conf.publicDir = conf.rootDir + '/public';
require('./environment.all.js')(conf);

module.exports = conf;