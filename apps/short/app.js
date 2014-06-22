module.exports = function(conf) {
    'use strict';

    var app = require('express').createServer();

    require('./environment.js')(app, conf);
    require('./routes.js')(app, conf);

    // worker
    var rootPath = process.cwd();
    var db  = require(rootPath + "/db/redisConnection.js")(conf),
        urlCounter = require(rootPath + '/classes/counter.js')('url', db),
        intervalID;


    try {
        var counter = urlCounter.get(),
            domain;

        intervalID = setInterval(function () {

            if (counter === 0) {
                console.log('[worker][url-clean]no more urls');
                clearInterval(intervalID);
                return;
            }
            counter--;
            domain = counter.toString(16);

            db.hget(domain, 'url', function(err, url) {

                if (err) {
                    console.log('[worker][url-clean]' + domain +', '+ err);
                    clearInterval(intervalID);
                    return;
                }

                url = url&&url.toString();

                if (!url) {
                    console.log('[worker][url-clean]' + domain +', url is not exists');
                    db.del('url:'+domain);
                    return;
                }

                if (checkBlacklist(url)) {
                    console.log('[worker][url-clean]' + domain +', url is in blacklist');
                    db.del('url:'+domain);
                    return;
                }



            });
        }, 1000);
    } catch (e) {
        console.log('worker died: ' + e);
    }

    var blacklist = conf.blacklist;
    var checkBlacklist = function(url) {
        if (url) {
            url = url.toLowerCase();
            var i= 0, blackListLen = blacklist.length;
            for (;i<blackListLen;i++) {
                if (url.indexOf(blacklist[i]) !== -1) {
                    return true;
                }
            }
        }

        return false;
    };


    return app;
};