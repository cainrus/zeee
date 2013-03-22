module.exports = (function() {

    var app = require('express').createServer();

    require('./environment.js')(app)
    require('./routes.js')(app)

    return app;
})();