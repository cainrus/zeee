module.exports = function(app, conf) {
    'use strict';

    var express = require('express'),
        stylus = require('stylus'),
        extend = require('xtend'),
        fs = require('fs'),
        path = require('path'),
        allowedDomain = ['http://', conf.subdomain, '.', conf.domainWithPort].join(''),
        allowedExtensions = {
            json: 1,
            js: 1,
            html: 1,
            css: 1,
            svg: 1,
            ttf: 1,
            png: 1,
            jpg: 1,
            swf: 1
        }
        ;

    var walk = function(dir) {
        var results = [];
        var list = fs.readdirSync(dir);
        list.forEach(function(file) {
            file = path.join(dir,  file);
            var stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                results = results.concat(walk(file));
            } else {
                results.push(file);
            }
        });
        return results;
    };


    app.configure('all', function() {

        // Collect availible views
        conf.templates = walk(path.join(conf.rootDir, 'views'));

        app.use(function(req, res, next) {
            var extension = req.url.split('.').pop().replace(/\W.+/, ''),
                method = req.method;

            // Restrict by method.
            if ('GET' !== method && 'HEAD' !== method) {
                return res.send('Bad request', 400);
            // Restrict by invalid or missing extension.
            } else if (!extension || !allowedExtensions[extension]) {
                return res.send('Not found', 404);
            // Restrict cross domain ajax transport.
            } else {
                // Check CORS
                res.header('Access-Control-Allow-Origin',  allowedDomain);
                res.header('Access-Control-Allow-Methods', 'GET, HEAD');
                res.header('Access-Control-Allow-Headers', 'Content-Type');
                res.header('Access-Control-Allow-Credentials', 'false');

                req.locals = req.locals || {};
                req.locals.extension = extension;

                return next();
            }
        });
    });

    var getDefaultStylusOptions = function(conf) {
        return {
            // Serve the stylus files from `dest` [true]
            serve: true,
            // Always re-compile
            force: false,
            // Source directory used to find .styl files
            src: conf.publicDir,
            // Destination directory used to output .css files when undefined defaults to `src`.
            dest: conf.publicDir,
            // Custom compile function, accepting the arguments `(str, path)`.
            /*
            compile: function (str, path, fn) {
                return stylus(str)
                    .set('filename', path)
                    .set('compress', false)
                    .render(fn);
            },
            */
            // Whether the output .css files should be compressed
            compress: true,
            // Emits debug infos in the generated css that can be used by the FireStylus Firebug plugin
            firebug: false,
            // Emits comments in the generated css indicating the corresponding stylus line
            linenos: false
        };
    };

    app.configure('development', function() {

        app.use(function(req, res, next) {
            res.header('app' , 'cdn' );
            next();
        });

        var options = extend(
            getDefaultStylusOptions(conf),
            {
                serve: true,
                force: true,
                compress: false,
                firebug: true,
                linenos: true
            });

        app.use(stylus.middleware(options));

        // Static files.
        app.use(express.static( conf.publicDir));

        app.use(express.errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
    });

    var productionSetup = function() {
        // Stylus..
        app.use(
            stylus.middleware(
                getDefaultStylusOptions(conf)
            )
        );

        // Static files.
        app.use(express.static( conf.publicDir));

        var day = 86400000;
        app.use(express.static(conf.publicDir, { maxAge: day }));
    };

    app.configure('production', productionSetup);
    app.configure('test', productionSetup);
};
