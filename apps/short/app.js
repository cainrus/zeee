module.exports = function(conf) {
    'use strict';

    var app = require('express').createServer();

    require('./environment.js')(app, conf)
    require('./routes.js')(app, conf)

    return app;
};