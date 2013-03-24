module.exports = function(app) {

    var express = require('express');
    var common = require(process.cwd() + '/public/js/common.js');

    app.configure(function() {
        app.use(express.cookieParser());
        app.use(express.session({ secret: "zeee.sessions"}));
        app.use(express.bodyParser());
        //app.use(require('everyauth').middleware());
        app.use(express.methodOverride());

        app.use(function(req, res, next){
            req.subdomain = common.getSubdomain(req.headers.host);
            next();
        });

        app.use(app.router);
    });


    app.configure('development', function() {
        app.use(express.logger());
        app.use(express.errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
        app.locals({
          debug: true
        });
    });

    app.configure('production', function() {
        app.use(express.errorHandler());
    });

};
