(function () {
    'use strict';

    var path = require('path');

    var conf = {};
    conf.env = process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    conf.domain = process.env.NODE_ENV === 'production' ? 'ze.ee' : 'localhost.loc';
    conf.port = process.env.PORT || 5000;
    conf.domainWithPort = conf.domain + (conf.env === 'production' ? '' : (conf.port && conf.port !== 80 ? (':' + conf.port) : ''));
    conf.subdomain = 'www';
    conf.outerPort = 80;
    conf.protocol = 'http://';
    conf.rootDir = process.cwd();
    conf.publicDir = path.join(conf.rootDir, 'public');
    conf.registeredSubdomain = [];
    module.exports = conf;
}());