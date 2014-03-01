module.exports = function(app, conf) {
    'use strict';

    var rootPath = process.cwd(),

        // inject common client/server functions
        common = require(rootPath + '/public/js/common.js'),
        // redis db instance
        db  = require(rootPath + "/db/redisConnection.js")(conf),
        // url counter.
        urlCounter = require(rootPath + '/classes/counter.js')('url', db),
        ga = require(rootPath + '/google/analytics/server.ga.js')
    ;

    /**
     * Check, if it's valid subdomain for redirection
     *
     * @param {String} subdomain
     * @return {Boolean}
     */
    var isRedirectSubdomain = function(subdomain){
        return !{'www':1, '':1}[subdomain];
    };

    /**
     * Redirection by domain or 404
     */
    app.get('*', function(req, res, next) {
        var subdomain = req.subdomain;
        
        // process only non-system subdomains
        if (isRedirectSubdomain(subdomain)) {
            var urlKey = 'url:'+subdomain;
            db.hget(urlKey, 'url', function(err, url) {
                url = url&&url.toString();
                if (url) {
                    res.writeHead(302, {
                        'Location': url
                    });
                    res.end();
                    db.HINCRBY('url:'+subdomain, 'count', 1);
                    ga.trackEvent({
                        category: 'Jump',
                        action: url,
                        label: subdomain
                    });
                 } else {
                    next();
                 }
            });
        } else {
            next();
        }
    });

    app.get('/last-urls', function(req, res) {

        req.session.urls = req.session.urls||[];
        // load and return short-url objects
        if (req.session.urls.length) {
            var urlCodes = req.session.urls.slice(0);
            var query = db.multi();
            while (urlCodes.length) {
                query.hgetall('url:'+urlCodes.shift());
            }
            query.exec(function (err, replies) {
                var json = JSON.stringify(replies);
                res.send(json);
            });
        // or return plain array.
        } else {
            res.send('[]');
        }
    });

    /**
     * Short url management
     */
    app.get('/', function(req, res) {
        res.render('short/index.jade', {appname:'short', title: 'Url shortener service'});
    });

    var ipThrottler = (function() {

        var updateDataInterval,
            ipData = {}, // хэш со счетчиком на каждый ip
            throttleLimit = 10, // макс кол-во сохраненных попыток.
            attemptLiveTime = 10*1000, // время жизни попытки
            daemonTimer = 3000,
            console = {log:function(){}}, // debug
            updateData = function() {
                var dates, curDate = new Date()-0;

                for (var ip in ipData) {
                    if (ipData.hasOwnProperty(ip)) {
                        dates = ipData[ip];
                        console.log('check ip:' + ip);
                        if (!dates.length) {
                            console.log('no attempts, clear ip: '+ip);
                            delete ipData[ip];
                        } else {
                            // чистим старые попытки для ip.
                            for (var i=0; i<dates.length; i++) {
                                var timeDiff = curDate - dates[0];

                                if (timeDiff > attemptLiveTime) {
                                    dates.shift();
                                    console.log('delete attempt for ip '+ip+', current:'+dates.length);

                                } else {
                                    console.log('timeleft: ' + ((attemptLiveTime-timeDiff)/1000) + 's')
                                }

                                // удаляем ip, если больше нет попыток.
                                if (!dates.length) {
                                    console.log('no attempts, clear ip: '+ip);
                                    delete ipData[ip];
                                }
                                break;

                            }
                        }
                    }
                }
                var count = 0;
                for (var key in ipData) {
                    if (ipData.hasOwnProperty(key)) {
                        count++;
                    }
                }
                if (!count) {
                    downDataUpdate();
                }


            },

            getAttemptsDates = function(ip) {
                ipData[ip] = ipData[ip] || [];
                return ipData[ip];
            },
            addAttempt = function(ip) {
                var dates = getAttemptsDates(ip);
                dates.push(new Date()-0);
                ipData[ip] = dates;
            },
            attemptsCount = function(ip) {
                return ipData[ip] ? ipData[ip].length : 0;
            },

            setupDataUpdate = function() {
                console.log('check setup dataUpdate');
                if (!updateDataInterval) {
                    console.log('dataUpdate daemon inited');
                    updateDataInterval = setInterval(function() {
                        updateData();
                    }, daemonTimer);
                }
            },
            downDataUpdate = function() {
                console.log('kill dataUpdate daemon');
                clearInterval(updateDataInterval);
                updateDataInterval = null;
            };



        return {
            checkIpThrottled: function(ip) {
                // is limit is exceeded?
                var attempts_count = attemptsCount(ip);
                console.log('current attempts count for ip:' + ip +', is ' + attempts_count);
                var exceeded = attempts_count > throttleLimit;
                console.log('exceeded? ' +(exceeded?'yes':'no'));
                // log attempt.
                addAttempt(ip);

                setupDataUpdate();

                return exceeded;
            }
        };
    }());

    // Create new short url API
    app.post('/create', function(req, res) {

        if (ipThrottler.checkIpThrottled(req.headers['x-forwarded-for'] || req.connection.remoteAddress)) {
            res.send('{"error":"You try too hard. Chill.."}');

        }



        var count = urlCounter.generate();
        var shrt = count.toString(16);
        var orig = common.normalizeUrl(req.body.orig);
        if (orig && common.isValidUrl(orig) && !common.isSameDomain(orig, conf.domain)) {
            db.hmset('url:'+shrt, {url:  orig, count: 0, short: shrt, created: new Date().getTime()}, function(err, value) {

                req.session.urls = req.session.urls||[];
                req.session.urls.unshift(shrt);
                req.session.urls = req.session.urls.slice(0, 5);
                if (err) {
                    res.send(JSON.stringify({error: 'Short url hasn\'t been created. Please, try again later.'}))
                } else {
                    res.send(JSON.stringify({shrt: shrt, orig: orig, status: 'updated'}));
                }
             });
        } else {
            res.send('{"error":"server error"}');
        }
    });

    // google webmaster.
    app.get('/google21e5eb1baababd2d.html', function(req, res) {
       res.send('google-site-verification: google21e5eb1baababd2d.html');
    });
};


