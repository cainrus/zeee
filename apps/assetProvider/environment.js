module.exports = function(app) {

    var express = require('express'),
        stylus = require('stylus'),
        rootPath = process.cwd(),
        conf   = require(rootPath + '/settings/environment.js');


    //CORS middleware
    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', 'http://www.' + conf.domain);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        next();
    };

    app.configure(function() {
        app.use(allowCrossDomain);
        app.register('.html', {
            compile: function (str, options) {
                return str;
            }
        });
    });

    app.configure('development', function() {
        /*
        app.use(stylus.middleware({
          debug: true,
          src: conf.publicDir,
          dest: conf.publicDir,

          compile: function (str, path, fn) {
            return stylus(str)
               .set('filename', path)
               .set('compress', false)
               .render(fn);
          },

          force: true
        }));*/

        app.use(stylus.middleware({
            src     : conf.publicDir,
            dest    : conf.publicDir,
            compile : function(str, path) {
              return stylus(str)
                .set('filename', path)
                .set('warn', true)
                .set('compress', true);
            }
        }));


        app.use(express.static(conf.publicDir));
/*        app.use(express.errorHandler({
            dumpExceptions: true
           ,showStack: true
        }));*/
    });

    app.configure('production', function() {
        app.use(stylus.middleware({
          debug: false,
          src: rootPath + '/public',
          dest: rootPath + '/public',
          compile: function (str) {
            return stylus(str)
              .set('compress', true);
          }
        }));
        var day = 86400000;
        app.use(express.static(conf.publicDir, { maxAge: day }));
    });
}
