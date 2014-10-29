module.exports = function(app, conf) {
    'use strict';

    var express = require('express');
    var common = require(process.cwd() + '/public/js/common.js');
    var jade = require('jade');
    var fs = require('fs');
    var scriptTmpl = jade.compile('<script src="#{src}"></script>');



    app.configure('all', function() {

        conf.blacklist = [
            'odkl2.com',
            'androidsuperapps.eu',
            'vl2v.biz',
            'systemecloudportailorange.esy.es'
        ];

        app.set('domain', conf.domainWithPort);

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

        // Jade: script render strategy.
        app.helpers({
            script: function (src) {
                return scriptTmpl({src: src.replace('#{domain}', conf.domainWithPort)});
            },
            scripts: function() {
                return '';
            }
        });

        // Jade: pretty html.
        app.set('view options', { pretty: true });

        app.use(function(req, res, next) {
            res.header('app' , 'short' );
            next();
        });

        app.use(express.logger());
        app.use(express.errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
    });

    var productionSetup = function() {
        // Jade: script rendering strategy.
        (function() {
            var scripts = '';
            app.helpers({
                script: function (src) {
                    var path = conf.publicDir + src.split('#{domain}').pop();
                    var debug = "\n" + '// ' + path + "\n";
                    scripts += debug + fs.readFileSync( path ) || '';
                    return '';
                },
                scripts: function(src) {
                    var parts = src.split('#{domain}');
                    var path = conf.publicDir + parts[parts.length-1];
                    var generatedScriptSrc = parts.join(conf.domainWithPort);
                    fs.writeFile(path, scripts, function(){});
                    scripts = '';
                    return scriptTmpl({src: generatedScriptSrc});
                }
            });
        }());

        app.use(express.errorHandler());
    };
    app.configure('production', productionSetup);
    app.configure('test', productionSetup);

};
