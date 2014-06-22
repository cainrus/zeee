module.exports = function(shortyApp) {
    var express = require('express');
    //var shortyApp = express.createServer();
    require('./environment.js')(shortyApp, express);
    require('./routes.js')(shortyApp);

};